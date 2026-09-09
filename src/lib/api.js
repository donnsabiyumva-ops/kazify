import { supabase } from "./supabaseClient.js";
import { fmt, fmtCompact, fmtDue, fmtRelative, fmtShortDate } from "./format.js";

function fail(action, error) {
  throw new Error(`${action} failed: ${error.message}`);
}

// ---------------------------------------------------------------------
// profiles / identity
//
// Real Supabase Auth: email OTP (a numeric code sent by email, no
// password, no third-party SMS provider). profiles.id is the Supabase
// Auth user id; the session itself is persisted by supabase-js, not by
// us. Phone/MoMo numbers aren't collected at signup — they're requested
// later, at checkout, when a client actually funds an escrow.
// ---------------------------------------------------------------------

export async function requestEmailCode(email, { createIfMissing }) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: createIfMissing },
  });
  if (error) fail("requestEmailCode", error);
}

export async function verifyEmailCode(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) fail("verifyEmailCode", error);
  return data.session;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOutSession() {
  await supabase.auth.signOut();
}

export async function getProfileById(id) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) fail("getProfileById", error);
  return data;
}

// Creates the profiles row for a just-verified auth user. id must equal
// the Supabase Auth user id (enforced by profiles_id_fkey).
export async function createProfile({ id, email, name, handle, city }) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id,
      email,
      name,
      handle: handle.charAt(0) === "@" ? handle : "@" + handle,
      city,
    })
    .select()
    .single();
  if (error) fail("createProfile", error);
  return data;
}

// Uploads a (pre-resized, JPEG) profile photo blob to the public "media"
// storage bucket and returns its public URL.
export async function uploadProfilePhoto(profileId, blob) {
  const path = `profile-photos/${profileId}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("media").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) fail("uploadProfilePhoto", error);
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

// Just toggles seller_onboarded — KYC is a separate, later step (prompted
// when a seller first tries to withdraw), not part of signup, so this
// never touches kyc_status.
export async function setSellerIntent(profileId, intent) {
  const wantsSelling = intent === "freelancer" || intent === "both";
  const { data, error } = await supabase.from("profiles").update({ seller_onboarded: wantsSelling }).eq("id", profileId).select().single();
  if (error) fail("setSellerIntent", error);
  return data;
}

export async function updateProfile(profileId, patch) {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", profileId).select().single();
  if (error) fail("updateProfile", error);
  return data;
}

export async function refreshKycDemo(profileId) {
  const { data, error } = await supabase.from("profiles").update({ kyc_status: "verified" }).eq("id", profileId).select().single();
  if (error) fail("refreshKycDemo", error);
  return data;
}

export async function submitKyc(profileId, { idType, idNumber }) {
  const { error: insertError } = await supabase
    .from("kyc_submissions")
    .insert({ profile_id: profileId, id_type: idType, id_number: idNumber, doc_front_url: "pending", doc_selfie_url: "pending" });
  if (insertError) fail("submitKyc", insertError);
  return updateProfile(profileId, { kyc_status: "review" });
}

export async function getPayoutMethods(profileId) {
  const { data, error } = await supabase.from("payout_methods").select("*").eq("profile_id", profileId).order("provider");
  if (error) fail("getPayoutMethods", error);
  return (data ?? []).map((m) => ({ key: m.provider, name: m.label, id: m.id, short: m.provider === "mtn" ? "MTN" : "AIR", msisdn: m.msisdn }));
}

// ---------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) fail("getCategories", error);
  return data ?? [];
}

// ---------------------------------------------------------------------
// gigs / swipe deck / binder
// ---------------------------------------------------------------------

function mapGigRow(row) {
  const seller = row.seller;
  const category = row.category;
  return {
    id: row.id,
    sellerId: row.seller_id,
    handle: seller?.handle ?? "@unknown",
    rating: seller?.rating != null ? Number(seller.rating).toFixed(1) : "—",
    isDemo: !!seller?.is_demo,
    title: row.title,
    amount: Number(row.price_amount),
    price: fmt(row.price_amount),
    delivery: row.delivery_days,
    category: category?.name ?? "—",
    duration: "0:" + String(row.video_duration_seconds ?? 0).padStart(2, "0"),
    videoUrl: row.video_asset_url,
  };
}

const GIG_SELECT = "*, seller:profiles!gigs_seller_id_fkey(handle, rating, is_demo), category:categories(name)";

export async function getFeed(clientId, { query, categories } = {}) {
  // Only "passed" gigs are excluded — shortlisted ones stay in rotation
  // too (recirculating on the next refetch/reshuffle), since there's not
  // enough content yet for the deck to otherwise stay full.
  const { data: swiped, error: swipedError } = await supabase.from("swipes").select("gig_id").eq("client_id", clientId).eq("direction", "left");
  if (swipedError) fail("getFeed", swipedError);
  const excludeIds = (swiped ?? []).map((s) => s.gig_id);

  let q = supabase.from("gigs").select(GIG_SELECT).eq("status", "active").neq("seller_id", clientId).order("created_at");
  if (excludeIds.length) q = q.not("id", "in", `(${excludeIds.join(",")})`);
  if (categories?.length) {
    const { data: catRows, error: catError } = await supabase.from("categories").select("id").in("name", categories);
    if (catError) fail("getFeed", catError);
    q = q.in("category_id", (catRows ?? []).map((c) => c.id));
  }
  if (query?.trim()) q = q.ilike("title", `%${query.trim()}%`);

  const { data, error } = await q;
  if (error) fail("getFeed", error);
  return (data ?? []).map(mapGigRow);
}

// Small public preview for the landing page — no client session needed,
// so there's nothing to exclude.
export async function getFeaturedGigs(limit = 6) {
  const { data, error } = await supabase.from("gigs").select(GIG_SELECT).eq("status", "active").order("created_at", { ascending: false }).limit(limit);
  if (error) fail("getFeaturedGigs", error);
  return (data ?? []).map(mapGigRow);
}

// A seller's active gigs — used by the chat's "Hire Now" button when the
// conversation wasn't opened from a specific gig (e.g. from the inbox), so
// it can offer the right service (or a picker, if they have more than one).
export async function getGigsBySeller(sellerId) {
  const { data, error } = await supabase.from("gigs").select(GIG_SELECT).eq("seller_id", sellerId).eq("status", "active").order("created_at", { ascending: false });
  if (error) fail("getGigsBySeller", error);
  return (data ?? []).map(mapGigRow);
}

export async function createSwipe(clientId, gigId, direction) {
  const { error } = await supabase.from("swipes").upsert({ client_id: clientId, gig_id: gigId, direction }, { onConflict: "client_id,gig_id" });
  if (error) fail("createSwipe", error);
}

// "Reshuffle deck": brings passed gigs back into the feed without
// touching anything already shortlisted.
export async function clearPassedSwipes(clientId) {
  const { error } = await supabase.from("swipes").delete().eq("client_id", clientId).eq("direction", "left");
  if (error) fail("clearPassedSwipes", error);
}

export async function getBinder(clientId) {
  const { data, error } = await supabase
    .from("swipes")
    .select(`gig:gigs(${GIG_SELECT})`)
    .eq("client_id", clientId)
    .eq("direction", "right")
    .order("created_at", { ascending: false });
  if (error) fail("getBinder", error);
  return (data ?? []).map((row) => mapGigRow(row.gig));
}

export async function getGigById(id) {
  const { data, error } = await supabase.from("gigs").select(GIG_SELECT).eq("id", id).maybeSingle();
  if (error) fail("getGigById", error);
  return data ? mapGigRow(data) : null;
}

// Uploads a service video/photo to the public "media" storage bucket and
// returns its public URL.
export async function uploadServiceMedia(sellerId, file) {
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
  const path = `service-media/${sellerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true, contentType: file.type });
  if (error) fail("uploadServiceMedia", error);
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function createGig({ sellerId, categoryId, title, price, deliveryDays, videoUrl }) {
  const { data, error } = await supabase
    .from("gigs")
    .insert({ seller_id: sellerId, category_id: categoryId, title, price_amount: price, delivery_days: deliveryDays, video_asset_url: videoUrl ?? null, status: "active" })
    .select()
    .single();
  if (error) fail("createGig", error);
  return data;
}

// ---------------------------------------------------------------------
// orders (escrow-backed hires)
// ---------------------------------------------------------------------

export async function fundEscrow({ gig, clientId, payoutMethodId }) {
  const feeAmount = Math.round(gig.amount * 0.05);
  const { data, error } = await supabase
    .from("orders")
    .insert({
      gig_id: gig.id,
      client_id: clientId,
      seller_id: gig.sellerId,
      payout_method_id: payoutMethodId,
      amount: gig.amount,
      fee_amount: feeAmount,
      total_amount: gig.amount + feeAmount,
      escrow_status: "held",
      due_at: new Date(Date.now() + gig.delivery * 86400000).toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) fail("fundEscrow", error);

  await supabase.from("notifications").insert({
    profile_id: gig.sellerId,
    role_context: "selling",
    kind: "order_new",
    title: `New order: ${gig.title}`,
    payload: { order_id: data.id },
  });

  return data;
}

function mapOrderRow(row) {
  return {
    id: row.id,
    buyer: row.client?.handle ?? "@unknown",
    title: row.gig?.title ?? "",
    amount: Number(row.amount),
    price: fmt(row.amount),
    due: fmtDue(row.due_at),
    status: row.status,
  };
}

// Public trust stats for a seller's profile — completed-order count and
// on-time-delivery rate, computed from real orders rather than shown
// as a placeholder.
export async function getSellerStats(sellerId) {
  const { data, error } = await supabase.from("orders").select("status, due_at, delivered_at").eq("seller_id", sellerId).in("status", ["approved", "delivered"]);
  if (error) fail("getSellerStats", error);
  const rows = data ?? [];
  const done = rows.filter((r) => r.status === "approved").length;
  const withDueDate = rows.filter((r) => r.delivered_at && r.due_at);
  const onTimeCount = withDueDate.filter((r) => new Date(r.delivered_at) <= new Date(r.due_at + "T23:59:59")).length;
  return { done, onTime: withDueDate.length ? Math.round((onTimeCount / withDueDate.length) * 100) + "%" : "—" };
}

export async function getOrdersForSeller(sellerId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, client:profiles!orders_client_id_fkey(handle), gig:gigs(title)")
    .eq("seller_id", sellerId)
    .neq("status", "declined")
    .order("created_at", { ascending: false });
  if (error) fail("getOrdersForSeller", error);
  return (data ?? []).map(mapOrderRow);
}

const CONTRACT_STATUS = {
  new: { label: "In review", tone: "amber" },
  active: { label: "In progress", tone: "emerald" },
  delivered: { label: "Delivered", tone: "slate" },
  approved: { label: "Approved", tone: "emerald" },
  declined: { label: "Declined", tone: "slate" },
  disputed: { label: "Disputed", tone: "amber" },
};

export async function getOrdersForClient(clientId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, seller:profiles!orders_seller_id_fkey(handle), gig:gigs(title)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) fail("getOrdersForClient", error);
  return (data ?? []).map((row) => ({
    id: row.id,
    handle: row.seller?.handle ?? "@unknown",
    title: row.gig?.title ?? "",
    price: fmt(row.amount),
    status: CONTRACT_STATUS[row.status]?.label ?? row.status,
    rawStatus: row.status,
    tone: CONTRACT_STATUS[row.status]?.tone ?? "slate",
  }));
}

export async function getEscrowInFlight(clientId) {
  const { data, error } = await supabase.from("orders").select("total_amount").eq("client_id", clientId).eq("escrow_status", "held");
  if (error) fail("getEscrowInFlight", error);
  return (data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
}

export async function acceptOrder(orderId) {
  const { error } = await supabase.from("orders").update({ status: "active", accepted_at: new Date().toISOString() }).eq("id", orderId);
  if (error) fail("acceptOrder", error);
}

export async function declineOrder(orderId) {
  const { error } = await supabase.from("orders").update({ status: "declined" }).eq("id", orderId);
  if (error) fail("declineOrder", error);
}

export async function deliverOrder(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("client_id, gig:gigs(title)")
    .single();
  if (error) fail("deliverOrder", error);

  const { data: client } = await supabase.from("profiles").select("auto_release_escrow").eq("id", data.client_id).maybeSingle();

  if (client?.auto_release_escrow) {
    await releaseEscrow(orderId);
    await supabase.from("notifications").insert({
      profile_id: data.client_id,
      role_context: "hiring",
      kind: "delivery_ready",
      title: `Delivered & auto-approved: ${data.gig?.title ?? "your order"} — escrow released`,
      payload: { order_id: orderId },
    });
  } else {
    await supabase.from("notifications").insert({
      profile_id: data.client_id,
      role_context: "hiring",
      kind: "delivery_ready",
      title: `Delivered: ${data.gig?.title ?? "your order"} — approve to release escrow`,
      payload: { order_id: orderId },
    });
  }
}

// Marks an order approved, releases its held escrow, and credits the
// seller's ledger — shared by an explicit client approval and by
// deliverOrder's auto-release path (client's "auto-release on approval"
// preference).
async function releaseEscrow(orderId) {
  const { data: order, error: fetchError } = await supabase.from("orders").select("seller_id, amount").eq("id", orderId).single();
  if (fetchError) fail("releaseEscrow", fetchError);

  const { error } = await supabase
    .from("orders")
    .update({ status: "approved", approved_at: new Date().toISOString(), escrow_status: "released" })
    .eq("id", orderId);
  if (error) fail("releaseEscrow", error);

  const { error: payoutError } = await supabase.from("payouts").insert({
    profile_id: order.seller_id,
    order_id: orderId,
    kind: "escrow_release",
    amount: Number(order.amount),
    channel: "Kazify escrow",
  });
  if (payoutError) fail("releaseEscrow", payoutError);
}

// The client explicitly approving a delivered order.
export async function approveOrder(orderId) {
  await releaseEscrow(orderId);

  const { data: order } = await supabase.from("orders").select("seller_id, gig:gigs(title)").eq("id", orderId).maybeSingle();
  await supabase.from("notifications").insert({
    profile_id: order.seller_id,
    role_context: "selling",
    kind: "escrow_released",
    title: `Approved: ${order.gig?.title ?? "your order"} — escrow released to your balance`,
    payload: { order_id: orderId },
  });
}

export async function disputeOrder(orderId) {
  const { error } = await supabase.from("orders").update({ status: "disputed" }).eq("id", orderId);
  if (error) fail("disputeOrder", error);
}

// ---------------------------------------------------------------------
// reels
// ---------------------------------------------------------------------

export async function getReelsForSeller(sellerId) {
  const { data, error } = await supabase.from("reels").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false });
  if (error) fail("getReelsForSeller", error);
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    views: fmtCompact(r.views),
    saves: fmtCompact(r.saves),
    state: r.state.charAt(0).toUpperCase() + r.state.slice(1),
    mediaType: r.media_type,
    videoUrl: r.video_asset_url,
    slideUrls: r.slide_urls ?? [],
  }));
}

export async function createReel({ sellerId, gigId, title, mediaType, videoUrl, slideUrls }) {
  const { data, error } = await supabase
    .from("reels")
    .insert({
      seller_id: sellerId,
      gig_id: gigId ?? null,
      title,
      media_type: mediaType,
      video_asset_url: videoUrl ?? null,
      slide_urls: slideUrls ?? null,
      state: "live",
    })
    .select()
    .single();
  if (error) fail("createReel", error);
  return data;
}

// ---------------------------------------------------------------------
// payouts / earnings
// ---------------------------------------------------------------------

const PAYOUT_ICON = {
  escrow_release: "arrow-down-left",
  refund: "arrow-down-left",
  boost_refund: "rotate-ccw",
  withdrawal: "arrow-up-right",
  adjustment: "arrow-down-left",
};

const PAYOUT_LABEL = {
  escrow_release: (row) => `Escrow release${row.order?.client?.handle ? " · " + row.order.client.handle : ""}`,
  withdrawal: () => "Withdrawal to MoMo",
  refund: () => "Refund issued",
  boost_refund: () => "Boost refund",
  adjustment: () => "Adjustment",
};

export async function getPayouts(profileId) {
  const { data, error } = await supabase
    .from("payouts")
    .select("*, order:orders(client:profiles!orders_client_id_fkey(handle))")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) fail("getPayouts", error);
  return (data ?? []).map((p) => {
    const amount = Number(p.amount);
    const sign = amount >= 0 ? "+" : "−";
    return {
      label: PAYOUT_LABEL[p.kind]?.(p) ?? p.kind,
      date: fmtShortDate(p.created_at),
      channel: p.channel,
      amount: `${sign} ${fmt(Math.abs(amount))}`,
      icon: PAYOUT_ICON[p.kind] ?? "arrow-down-left",
    };
  });
}

export async function getAvailableBalance(profileId) {
  const { data, error } = await supabase.from("payouts").select("amount").eq("profile_id", profileId);
  if (error) fail("getAvailableBalance", error);
  return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
}

export async function getEscrowHeld(sellerId) {
  const { data, error } = await supabase.from("orders").select("amount").eq("seller_id", sellerId).eq("escrow_status", "held").neq("status", "new");
  if (error) fail("getEscrowHeld", error);
  return { total: (data ?? []).reduce((sum, o) => sum + Number(o.amount), 0), count: (data ?? []).length };
}

export async function withdraw(profileId, amount, channel) {
  const { error } = await supabase.from("payouts").insert({ profile_id: profileId, kind: "withdrawal", amount: -amount, channel });
  if (error) fail("withdraw", error);
}

// ---------------------------------------------------------------------
// messages: direct chat between a client and a seller
// ---------------------------------------------------------------------

function mapMessageRow(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function getThread(meId, otherId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${meId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${meId})`)
    .order("created_at", { ascending: true });
  if (error) fail("getThread", error);
  return (data ?? []).map(mapMessageRow);
}

export async function sendMessage({ senderId, recipientId, body }) {
  const { data, error } = await supabase.from("messages").insert({ sender_id: senderId, recipient_id: recipientId, body }).select().single();
  if (error) fail("sendMessage", error);

  await supabase.from("notifications").insert({
    profile_id: recipientId,
    role_context: "hiring",
    kind: "message",
    title: "New message",
    payload: { sender_id: senderId },
  });

  return mapMessageRow(data);
}

// One row per counterpart, newest message first — built client-side since
// there's no reason to add a db view for a thread list this small.
export async function getConversations(meId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(handle, photo_url), recipient:profiles!messages_recipient_id_fkey(handle, photo_url)")
    .or(`sender_id.eq.${meId},recipient_id.eq.${meId}`)
    .order("created_at", { ascending: false });
  if (error) fail("getConversations", error);

  const seen = new Map();
  for (const row of data ?? []) {
    const otherId = row.sender_id === meId ? row.recipient_id : row.sender_id;
    if (seen.has(otherId)) continue;
    const other = row.sender_id === meId ? row.recipient : row.sender;
    seen.set(otherId, {
      id: otherId,
      handle: other?.handle ?? "@unknown",
      photoUrl: other?.photo_url ?? null,
      lastMessage: row.body,
      lastAt: fmtRelative(row.created_at),
      mine: row.sender_id === meId,
    });
  }
  return Array.from(seen.values());
}

// ---------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------

export async function getNotifications(profileId) {
  const { data, error } = await supabase.from("notifications").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(20);
  if (error) fail("getNotifications", error);
  return (data ?? []).map((n) => ({
    id: n.id,
    role: n.role_context === "selling" ? "freelancer" : "client",
    tag: n.role_context === "selling" ? "Selling" : "Hiring",
    tab: n.role_context === "selling" ? "Orders" : null,
    icon: { order_new: "inbox", delivery_ready: "package-check", escrow_released: "wallet", message: "message-circle" }[n.kind] ?? "bell",
    title: n.title,
    when: fmtRelative(n.created_at),
  }));
}
