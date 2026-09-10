import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { transfer } from "../_lib/momoClient.js";
import { normalizeMsisdn, isValidUgandaMsisdn } from "../_lib/msisdn.js";
import { toEurSandboxAmount } from "../_lib/sandboxAmount.js";

// Used by both an explicit client approval and deliverOrder's auto-release
// path (the buyer's "auto-release escrow on approval" preference). Marks
// the order approved immediately (that decision is final either way) but
// only flips escrow_status to 'released' once the disbursement to the
// seller actually confirms SUCCESSFUL — see payout-status.js.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "orderId is required" });

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, seller_id, amount, status, gig:gigs(title)")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) return res.status(500).json({ error: orderError.message });
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status !== "delivered") return res.status(409).json({ error: "Order isn't awaiting approval" });

  const { data: method, error: methodError } = await supabaseAdmin
    .from("payout_methods")
    .select("msisdn")
    .eq("profile_id", order.seller_id)
    .eq("provider", "mtn")
    .maybeSingle();
  if (methodError) return res.status(500).json({ error: methodError.message });
  const msisdn = normalizeMsisdn(method?.msisdn);
  if (!isValidUgandaMsisdn(msisdn)) {
    return res.status(422).json({ code: "no_payout_method", error: "Seller has no valid MTN MoMo number on file yet" });
  }

  const { error: approveError } = await supabaseAdmin.from("orders").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", orderId);
  if (approveError) return res.status(500).json({ error: approveError.message });

  const eurAmount = toEurSandboxAmount(order.amount);
  const referenceId = randomUUID();

  const { data: payout, error: payoutError } = await supabaseAdmin
    .from("payouts")
    .insert({
      profile_id: order.seller_id,
      order_id: orderId,
      kind: "escrow_release",
      amount: order.amount,
      channel: "MTN MoMo",
      status: "pending",
      momo_disbursement_reference_id: referenceId,
      momo_disbursement_requested_at: new Date().toISOString(),
      momo_sandbox_amount: eurAmount,
      momo_sandbox_currency: "EUR",
    })
    .select()
    .single();
  if (payoutError) return res.status(500).json({ error: payoutError.message });

  try {
    await transfer({
      referenceId,
      amountEur: eurAmount,
      externalId: payout.id,
      msisdn,
      payerMessage: `Escrow release: ${order.gig?.title ?? "your order"}`.slice(0, 160),
      payeeNote: "Kazify escrow release",
    });
  } catch (err) {
    await supabaseAdmin.from("payouts").update({ status: "failed", momo_disbursement_resolved_at: new Date().toISOString() }).eq("id", payout.id);
    return res.status(502).json({ error: "MTN transfer failed: " + err.message, payoutId: payout.id });
  }

  return res.status(202).json({ payoutId: payout.id, referenceId, momoStatus: "PENDING", sellerId: order.seller_id, gigTitle: order.gig?.title ?? "" });
}
