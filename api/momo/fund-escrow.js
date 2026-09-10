import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { requestToPay } from "../_lib/momoClient.js";
import { normalizeMsisdn, isValidUgandaMsisdn } from "../_lib/msisdn.js";
import { toEurSandboxAmount } from "../_lib/sandboxAmount.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gigId, clientId, payoutMethodId } = req.body || {};
  if (!gigId || !clientId || !payoutMethodId) {
    return res.status(400).json({ error: "gigId, clientId, and payoutMethodId are required" });
  }

  const { data: gig, error: gigError } = await supabaseAdmin
    .from("gigs")
    .select("id, seller_id, title, price_amount, delivery_days, status")
    .eq("id", gigId)
    .maybeSingle();
  if (gigError) return res.status(500).json({ error: gigError.message });
  if (!gig || gig.status !== "active") return res.status(404).json({ error: "Gig not found or no longer active" });
  if (gig.seller_id === clientId) return res.status(400).json({ error: "Can't hire your own gig" });

  const { data: method, error: methodError } = await supabaseAdmin
    .from("payout_methods")
    .select("id, profile_id, provider, msisdn")
    .eq("id", payoutMethodId)
    .maybeSingle();
  if (methodError) return res.status(500).json({ error: methodError.message });
  if (!method || method.profile_id !== clientId) return res.status(404).json({ error: "Payout method not found" });
  if (method.provider !== "mtn") return res.status(422).json({ error: "Only MTN Mobile Money is wired to the sandbox right now" });

  const msisdn = normalizeMsisdn(method.msisdn);
  if (!isValidUgandaMsisdn(msisdn)) return res.status(422).json({ error: "That MoMo number doesn't look valid — check it in Settings" });

  const amount = Number(gig.price_amount);
  const feeAmount = Math.round(amount * 0.05);
  const totalAmount = amount + feeAmount;
  const eurAmount = toEurSandboxAmount(totalAmount);
  const referenceId = randomUUID();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      gig_id: gig.id,
      client_id: clientId,
      seller_id: gig.seller_id,
      payout_method_id: payoutMethodId,
      amount,
      fee_amount: feeAmount,
      total_amount: totalAmount,
      escrow_status: "unfunded",
      due_at: new Date(Date.now() + gig.delivery_days * 86400000).toISOString().slice(0, 10),
      momo_collection_reference_id: referenceId,
      momo_collection_status: "PENDING",
      momo_collection_requested_at: new Date().toISOString(),
      momo_sandbox_amount: eurAmount,
      momo_sandbox_currency: "EUR",
    })
    .select()
    .single();
  if (orderError) return res.status(500).json({ error: orderError.message });

  try {
    await requestToPay({
      referenceId,
      amountEur: eurAmount,
      externalId: order.id,
      msisdn,
      payerMessage: `Kazify order: ${gig.title}`.slice(0, 160),
      payeeNote: "Kazify escrow",
    });
  } catch (err) {
    await supabaseAdmin
      .from("orders")
      .update({ momo_collection_status: "FAILED", momo_collection_resolved_at: new Date().toISOString() })
      .eq("id", order.id);
    return res.status(502).json({ error: "MTN request failed: " + err.message, orderId: order.id });
  }

  return res.status(202).json({ orderId: order.id, referenceId, momoStatus: "PENDING" });
}
