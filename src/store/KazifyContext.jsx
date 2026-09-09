import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as api from "../lib/api.js";
import { fmt } from "../lib/format.js";
import { resizeImage } from "../lib/image.js";

const ACCENT = "#059669";

const KazifyContext = createContext(null);

const initialAuth = {
  step: "email",
  mode: "signup",
  email: "",
  otp: "",
  name: "",
  handle: "",
  city: "Kampala, UG",
  intent: null,
  profileId: null,
};

const initialState = {
  query: "",
  cats: [],
  exit: null,
  checkoutId: null,
  profileId: null,
  method: "mtn",
  funded: false,
  railPinned: false,
  userOpen: false,
  notifOpen: false,
  toast: null,
  draft: null,
  kycOpen: false,
  uploadOpen: false,
  role: "client",
  sellerTab: "Dashboard",
  facet: "hiring",
  auth: null,
  authBusy: false,
  bootstrapped: false,
  inboxOpen: false,
  chatWith: null,
};

export function KazifyProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [me, setMe] = useState(null);
  const [feed, setFeed] = useState([]);
  const [binder, setBinder] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [ordersSeller, setOrdersSeller] = useState([]);
  const [ordersClient, setOrdersClient] = useState([]);
  const [reels, setReels] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [escrowHeldSeller, setEscrowHeldSeller] = useState({ total: 0, count: 0 });
  const [escrowInFlightClient, setEscrowInFlightClient] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState([]);
  const [threadBusy, setThreadBusy] = useState(false);
  const gigsById = useRef(new Map());
  const toastTimer = useRef(null);

  const patch = useCallback((updater) => {
    setState((prev) => ({ ...prev, ...(typeof updater === "function" ? updater(prev) : updater) }));
  }, []);

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setState((prev) => ({ ...prev, toast: msg }));
    toastTimer.current = setTimeout(() => setState((prev) => ({ ...prev, toast: null })), 2400);
  }, []);

  const cacheGigs = useCallback((gigs) => {
    for (const g of gigs) gigsById.current.set(g.id, g);
  }, []);

  // rehydrate the real Supabase Auth session on load, if there is one —
  // supabase-js persists it itself, we just have to look it up
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await api.getSession();
      if (session?.user) {
        try {
          const profile = await api.getProfileById(session.user.id);
          if (!cancelled && profile) {
            setMe(profile);
            setState((prev) => ({ ...prev, auth: null, role: profile.seller_onboarded ? prev.role : "client" }));
          }
        } catch {
          // leave them at the auth screen
        }
      }
      if (!cancelled) setState((prev) => ({ ...prev, bootstrapped: true }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reloadAll = useCallback(
    async (profile) => {
      const [cats, methods, notifs, bind, ordC] = await Promise.all([
        api.getCategories(),
        api.getPayoutMethods(profile.id),
        api.getNotifications(profile.id),
        api.getBinder(profile.id),
        api.getOrdersForClient(profile.id),
      ]);
      setCategoriesData(cats);
      setPayoutMethods(methods);
      setNotifications(notifs);
      setBinder(bind);
      cacheGigs(bind);
      setOrdersClient(ordC);
      setEscrowInFlightClient(await api.getEscrowInFlight(profile.id));

      if (profile.seller_onboarded) {
        const [ordS, rls, pay, bal, held] = await Promise.all([
          api.getOrdersForSeller(profile.id),
          api.getReelsForSeller(profile.id),
          api.getPayouts(profile.id),
          api.getAvailableBalance(profile.id),
          api.getEscrowHeld(profile.id),
        ]);
        setOrdersSeller(ordS);
        setReels(rls);
        setPayouts(pay);
        setAvailableBalance(bal);
        setEscrowHeldSeller(held);
      }
    },
    [cacheGigs]
  );

  useEffect(() => {
    if (me) reloadAll(me);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, me?.seller_onboarded, reloadAll]);

  // swipe feed: refetch when the client, search, or category filters change
  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const rows = await api.getFeed(me.id, { query: state.query, categories: state.cats });
      if (!cancelled) {
        setFeed(rows);
        cacheGigs(rows);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, state.query, state.cats, cacheGigs]);

  // top up the deck before it visibly runs out — there isn't enough
  // content yet for it to otherwise stay full, so this recirculates
  // passed/shortlisted gigs in behind whatever's still showing, with no
  // "deck cleared" gap and no manual reshuffle needed
  useEffect(() => {
    if (!me || feed.length > 1) return;
    let cancelled = false;
    (async () => {
      try {
        await api.clearPassedSwipes(me.id);
        const rows = await api.getFeed(me.id, { query: state.query, categories: state.cats });
        if (cancelled) return;
        setFeed((prev) => {
          const ids = new Set(prev.map((g) => g.id));
          return prev.concat(rows.filter((g) => !ids.has(g.id)));
        });
        cacheGigs(rows);
      } catch (err) {
        say(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id, feed.length]);

  const editAuth = useCallback((key, val) => {
    setState((prev) => ({ ...prev, auth: { ...prev.auth, [key]: val } }));
  }, []);

  // Opens the signup/login flow from the landing page.
  const startAuth = useCallback((mode) => {
    setState((prev) => ({ ...prev, auth: { ...initialAuth, mode } }));
  }, []);

  // Backs out of the auth flow entirely, back to the landing page.
  const closeAuth = useCallback(() => {
    setState((prev) => ({ ...prev, auth: null }));
  }, []);

  // Sends the email code. Login fails fast here (shouldCreateUser
  // is false) if no account exists for that email — no code is sent.
  const sendEmailCode = useCallback(
    async (a, { resend } = {}) => {
      setState((prev) => ({ ...prev, authBusy: true }));
      try {
        await api.requestEmailCode(a.email.trim(), { createIfMissing: a.mode === "signup" });
        setState((prev) => ({ ...prev, authBusy: false, auth: { ...prev.auth, step: "otp" } }));
        if (resend) say("New code sent by email");
      } catch (err) {
        setState((prev) => ({ ...prev, authBusy: false }));
        say(a.mode === "login" ? "No Kazify account found for that email — try creating one" : err.message || "Something went wrong — try again");
      }
    },
    [say]
  );

  // Verifies the code. An existing account logs straight in; a brand-new
  // one (or a signup that never finished) continues to the profile step.
  const verifyEmailStep = useCallback(
    async (a) => {
      setState((prev) => ({ ...prev, authBusy: true }));
      try {
        const session = await api.verifyEmailCode(a.email.trim(), a.otp.trim());
        const profile = await api.getProfileById(session.user.id);
        if (profile) {
          setMe(profile);
          setState((prev) => ({ ...prev, auth: null, authBusy: false, role: profile.seller_onboarded ? prev.role : "client" }));
          say(`Welcome back, ${(profile.name || "").split(" ")[0] || profile.handle}`);
        } else {
          setState((prev) => ({ ...prev, authBusy: false, auth: { ...prev.auth, profileId: session.user.id, step: "profile" } }));
        }
      } catch (err) {
        setState((prev) => ({ ...prev, authBusy: false }));
        say(err.message || "That code didn't work — check it and try again");
      }
    },
    [say]
  );

  // Creates the profiles row now that the email is verified, before the
  // intent/kyc steps.
  const resolveProfile = useCallback(
    async (a) => {
      setState((prev) => ({ ...prev, authBusy: true }));
      try {
        const profile = await api.createProfile({
          id: a.profileId,
          email: a.email.trim(),
          name: a.name.trim(),
          handle: a.handle.trim(),
          city: a.city.trim() || "Kampala, UG",
        });
        setState((prev) => ({ ...prev, authBusy: false, auth: { ...prev.auth, profileId: profile.id, step: "intent" } }));
      } catch (err) {
        setState((prev) => ({ ...prev, authBusy: false }));
        say(err.message || "Something went wrong — try again");
      }
    },
    [say]
  );

  const finishAuth = useCallback(
    async (a, intent) => {
      setState((prev) => ({ ...prev, authBusy: true }));
      try {
        let profile = a.profileId ? await api.getProfileById(a.profileId) : null;
        if (!profile) throw new Error("Something went wrong — go back and try again");
        if (intent !== "client") {
          profile = await api.setSellerIntent(profile.id, intent);
        }
        setMe(profile);
        setState((prev) => ({ ...prev, auth: null, authBusy: false, role: intent === "freelancer" ? "freelancer" : "client" }));
        say(intent === "client" ? "Welcome to Kazify" : "Welcome to Kazify — post your first service any time");
      } catch (err) {
        setState((prev) => ({ ...prev, authBusy: false }));
        say(err.message || "Something went wrong — try again");
      }
    },
    [say]
  );

  const signOut = useCallback(() => {
    api.signOutSession();
    setMe(null);
    setFeed([]);
    setBinder([]);
    setOrdersSeller([]);
    setOrdersClient([]);
    setReels([]);
    setPayouts([]);
    setNotifications([]);
    setPayoutMethods([]);
    setState((prev) => ({
      ...prev,
      auth: { ...initialAuth, mode: "login" },
      userOpen: false,
      notifOpen: false,
      draft: null,
    }));
  }, []);

  const patchMe = useCallback(
    (fields) => {
      setMe((prev) => (prev ? { ...prev, ...fields } : prev));
      if (me) api.updateProfile(me.id, fields).catch((err) => say(err.message));
    },
    [me, say]
  );

  const editDraft = useCallback((key, val) => {
    setState((prev) => ({ ...prev, draft: { ...prev.draft, [key]: val } }));
  }, []);

  const openSettings = useCallback(() => {
    setState((prev) => ({ ...prev, draft: me ? { ...me, window: me.escrow_release_window } : null }));
  }, [me]);

  const closeSettings = useCallback(() => setState((prev) => ({ ...prev, draft: null })), []);

  const saveSettings = useCallback(() => {
    setState((prev) => {
      const d = prev.draft;
      if (d) patchMe({ name: d.name, handle: d.handle, city: d.city, phone: d.phone, photo_url: d.photo_url, escrow_release_window: d.window });
      return { ...prev, draft: null };
    });
    say("Profile updated");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patchMe, say]);

  const pickPhoto = useCallback(
    async (file) => {
      if (!file || !me) return;
      if (!file.type.startsWith("image/")) {
        say("Please choose an image file");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        say("That photo is too large — try one under 8MB");
        return;
      }
      say("Uploading photo…");
      try {
        const resized = await resizeImage(file);
        const url = await api.uploadProfilePhoto(me.id, resized);
        setState((prev) => ({ ...prev, draft: { ...prev.draft, photo_url: url } }));
        say("Photo added — save to apply");
      } catch (err) {
        say(err.message || "Photo upload failed — try again");
      }
    },
    [me, say]
  );

  const removePhoto = useCallback(() => {
    setState((prev) => ({ ...prev, draft: { ...prev.draft, photo_url: null } }));
  }, []);

  const togglePref = useCallback(
    (key) => {
      if (!me) return;
      const field = key === "autoRelease" ? "auto_release_escrow" : "weekly_digest";
      patchMe({ [field]: !me[field] });
    },
    [me, patchMe]
  );

  // No real KYC vendor wired up yet (step 3 of the production roadmap) —
  // this just re-reads the current status rather than forcing it, so it's
  // honest about there being no verification actually happening yet.
  const refreshKyc = useCallback(async () => {
    if (!me) return;
    const updated = await api.getProfileById(me.id);
    setMe(updated);
    say(updated.kyc_status === "verified" ? "ID verified — payouts unlocked" : "Still in review");
  }, [me, say]);

  const upload = useCallback(() => setState((prev) => ({ ...prev, uploadOpen: true })), []);

  const createService = useCallback(
    async ({ title, price, deliveryDays, categoryId, mediaType, file, files }) => {
      if (!me) return false;
      try {
        let videoUrl = null;
        let slideUrls = null;
        if (mediaType === "video") {
          videoUrl = await api.uploadServiceMedia(me.id, file);
        } else {
          slideUrls = [];
          for (const f of files) {
            slideUrls.push(await api.uploadServiceMedia(me.id, f));
          }
        }
        const gig = await api.createGig({ sellerId: me.id, categoryId, title, price, deliveryDays, videoUrl });
        await api.createReel({ sellerId: me.id, gigId: gig.id, title, mediaType, videoUrl, slideUrls });
        setReels(await api.getReelsForSeller(me.id));
        setState((prev) => ({ ...prev, uploadOpen: false }));
        say("Service posted — it's live in the swipe deck");
        return true;
      } catch (err) {
        say(err.message || "Something went wrong — try again");
        return false;
      }
    },
    [me, say]
  );

  const swipe = useCallback(
    (dir) => {
      setState((prev) => {
        if (prev.exit || !feed[0]) return prev;
        return { ...prev, exit: dir, _swipeId: feed[0].id };
      });
    },
    [feed]
  );

  useEffect(() => {
    if (!state.exit || !state._swipeId || !me) return;
    const id = state._swipeId;
    const dir = state.exit;
    const t = setTimeout(async () => {
      setState((prev) => (prev._swipeId === id ? { ...prev, exit: null, _swipeId: null } : prev));
      if (dir === "right") {
        const gig = gigsById.current.get(id);
        if (gig) setBinder((prev) => (prev.some((g) => g.id === id) ? prev : [gig, ...prev]));
      }
      try {
        await api.createSwipe(me.id, id, dir);
      } catch (err) {
        say(err.message);
      }
      setFeed((prev) => prev.filter((g) => g.id !== id));
    }, 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.exit, state._swipeId, me, say]);

  const fund = useCallback(async () => {
    const gig = gigsById.current.get(state.checkoutId);
    if (!gig || !me) return;
    const method = payoutMethods.find((m) => m.key === state.method);
    try {
      await api.fundEscrow({ gig, clientId: me.id, payoutMethodId: method?.id });
      setState((prev) => ({ ...prev, funded: true }));
      setEscrowInFlightClient((prev) => prev + gig.amount + Math.round(gig.amount * 0.05));
      setOrdersClient(await api.getOrdersForClient(me.id));
    } catch (err) {
      say(err.message);
    }
  }, [state.checkoutId, state.method, me, payoutMethods, say]);

  const refetchSellerOrders = useCallback(async () => {
    if (!me) return;
    setOrdersSeller(await api.getOrdersForSeller(me.id));
  }, [me]);

  const acceptOrder = useCallback(
    async (id) => {
      await api.acceptOrder(id);
      say("Order accepted — clock started");
      refetchSellerOrders();
    },
    [say, refetchSellerOrders]
  );

  const declineOrder = useCallback(
    async (id) => {
      await api.declineOrder(id);
      say("Request declined");
      refetchSellerOrders();
    },
    [say, refetchSellerOrders]
  );

  const deliverOrder = useCallback(
    async (id) => {
      await api.deliverOrder(id);
      say("Delivery sent for approval");
      refetchSellerOrders();
      if (me) {
        // covers the auto-release case too (buyer has auto-release on, so
        // deliverOrder may have already paid out the seller)
        setEscrowHeldSeller(await api.getEscrowHeld(me.id));
        setPayouts(await api.getPayouts(me.id));
        setAvailableBalance(await api.getAvailableBalance(me.id));
      }
    },
    [say, refetchSellerOrders, me]
  );

  const refetchClientOrders = useCallback(async () => {
    if (!me) return;
    setOrdersClient(await api.getOrdersForClient(me.id));
    setEscrowInFlightClient(await api.getEscrowInFlight(me.id));
  }, [me]);

  const approveOrder = useCallback(
    async (id) => {
      try {
        await api.approveOrder(id);
        say("Approved — escrow released to the seller");
        refetchClientOrders();
      } catch (err) {
        say(err.message);
      }
    },
    [say, refetchClientOrders]
  );

  const disputeOrder = useCallback(
    async (id) => {
      try {
        await api.disputeOrder(id);
        say("Order marked as disputed");
        refetchClientOrders();
      } catch (err) {
        say(err.message);
      }
    },
    [say, refetchClientOrders]
  );

  const withdraw = useCallback(async () => {
    if (!me) return;
    if (me.kyc_status === "none") {
      setState((prev) => ({ ...prev, kycOpen: true }));
      return;
    }
    if (me.kyc_status !== "verified") {
      say("Payout locked until your ID check clears");
      return;
    }
    if (availableBalance <= 0) {
      say("Nothing available to withdraw yet");
      return;
    }
    const channel = payoutMethods.find((m) => m.key === "mtn")?.name ?? payoutMethods[0]?.name ?? "MTN MoMo";
    await api.withdraw(me.id, availableBalance, channel);
    say(`Withdrawal of UGX ${fmt(availableBalance)} sent to ${channel}`);
    setPayouts(await api.getPayouts(me.id));
    setAvailableBalance(await api.getAvailableBalance(me.id));
  }, [me, availableBalance, payoutMethods, say]);

  const submitKycNow = useCallback(
    async ({ idType, idNumber }) => {
      if (!me) return;
      try {
        const updated = await api.submitKyc(me.id, { idType, idNumber });
        setMe(updated);
        setState((prev) => ({ ...prev, kycOpen: false }));
        say("ID submitted — checks usually clear in minutes");
      } catch (err) {
        say(err.message);
      }
    },
    [me, say]
  );

  // Upgrades an existing hiring-only account to also sell — no ID
  // verification required upfront, matching signup: that's only prompted
  // later, at withdrawal.
  const becomeSeller = useCallback(async () => {
    if (!me) return;
    try {
      const profile = await api.setSellerIntent(me.id, "both");
      setMe(profile);
      setState((prev) => ({ ...prev, role: "freelancer", userOpen: false, sellerTab: "Dashboard" }));
      say("Selling unlocked — post your first service");
    } catch (err) {
      say(err.message);
    }
  }, [me, say]);

  const openNotifFrom = useCallback((n) => {
    setState((prev) => ({ ...prev, role: n.role, notifOpen: false, userOpen: false, sellerTab: n.tab || prev.sellerTab }));
  }, []);

  // Opens a direct chat with another profile — from a "Chat" button (leaves
  // the inbox list closed) or from picking a conversation in the inbox
  // (inboxOpen stays true underneath, so "back" returns to the list).
  // gigId is optional: when the chat was opened from a specific gig (a
  // profile page or the binder), it's carried along so the thread's
  // "Hire Now" button knows which service to check out without asking.
  const chat = useCallback(
    (otherId, handle, gigId = null) => {
      if (!me || otherId === me.id) return;
      setState((prev) => ({ ...prev, chatWith: { id: otherId, handle, gigId } }));
    },
    [me]
  );

  const closeChat = useCallback(() => setState((prev) => ({ ...prev, chatWith: null })), []);

  const openInbox = useCallback(async () => {
    if (!me) return;
    setState((prev) => ({ ...prev, inboxOpen: true, chatWith: null }));
    setConversations(await api.getConversations(me.id));
  }, [me]);

  const closeInbox = useCallback(() => setState((prev) => ({ ...prev, inboxOpen: false, chatWith: null })), []);

  useEffect(() => {
    if (!me || !state.chatWith) {
      setThread([]);
      return;
    }
    let cancelled = false;
    setThreadBusy(true);
    api
      .getThread(me.id, state.chatWith.id)
      .then((rows) => {
        if (!cancelled) setThread(rows);
      })
      .finally(() => {
        if (!cancelled) setThreadBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [me, state.chatWith]);

  const sendChatMessage = useCallback(
    async (body) => {
      const text = body.trim();
      if (!me || !state.chatWith || !text) return;
      try {
        const msg = await api.sendMessage({ senderId: me.id, recipientId: state.chatWith.id, body: text });
        setThread((prev) => prev.concat(msg));
      } catch (err) {
        say(err.message || "Message failed to send — try again");
      }
    },
    [me, state.chatWith, say]
  );

  const queue = ordersSeller;

  const value = useMemo(
    () => ({
      state,
      setState: patch,
      me,
      say,
      accent: ACCENT,
      fmt,
      visible: feed,
      binder,
      queue,
      categoriesData,
      ordersClient,
      reels,
      payouts,
      availableBalance,
      escrowHeldSeller,
      escrowInFlightClient,
      notifications,
      notifs: notifications,
      payoutMethods,
      queueCount: ordersSeller.filter((o) => o.status === "new").length,
      queueTotal: ordersSeller.reduce((a, o) => a + o.amount, 0),
      swipe,
      editAuth,
      startAuth,
      closeAuth,
      sendEmailCode,
      verifyEmailStep,
      resolveProfile,
      finishAuth,
      signOut,
      patchMe,
      editDraft,
      openSettings,
      closeSettings,
      saveSettings,
      pickPhoto,
      removePhoto,
      togglePref,
      refreshKyc,
      upload,
      createService,
      fund,
      acceptOrder,
      declineOrder,
      deliverOrder,
      approveOrder,
      disputeOrder,
      withdraw,
      submitKycNow,
      becomeSeller,
      openNotifFrom,
      chat,
      closeChat,
      openInbox,
      closeInbox,
      sendChatMessage,
      conversations,
      thread,
      threadBusy,
      getCachedGig: (id) => gigsById.current.get(id),
      cacheGigs,
      gigs: feed.concat(binder).concat(Array.from(gigsById.current.values())).filter((g, i, arr) => arr.findIndex((x) => x.id === g.id) === i),
    }),
    [
      state, patch, me, say, feed, binder, queue, categoriesData, ordersClient, reels, payouts,
      availableBalance, escrowHeldSeller, escrowInFlightClient, notifications, payoutMethods,
      ordersSeller, swipe, editAuth, startAuth, closeAuth, sendEmailCode, verifyEmailStep, resolveProfile, finishAuth, signOut, patchMe, editDraft,
      openSettings, closeSettings, saveSettings, pickPhoto, removePhoto, togglePref, refreshKyc,
      upload, createService, fund, acceptOrder, declineOrder, deliverOrder, approveOrder, disputeOrder, withdraw, submitKycNow, becomeSeller, openNotifFrom, chat,
      closeChat, openInbox, closeInbox, sendChatMessage, conversations, thread, threadBusy, cacheGigs,
    ]
  );

  return <KazifyContext.Provider value={value}>{children}</KazifyContext.Provider>;
}

export function useKazify() {
  const ctx = useContext(KazifyContext);
  if (!ctx) throw new Error("useKazify must be used within KazifyProvider");
  return ctx;
}
