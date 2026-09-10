import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { transfer } from "../_lib/momoClient.js";
import { normalizeMsisdn, isValidUgandaMsisdn } from "../_lib/msisdn.js";
import { toEurSandboxAmount } from "../_lib/sandboxAmount.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { profileId, amount } = req.body || {};
  if (!profileId || !amount || amount <= 0) return res.status(400).json({ error: "profileId and a positive amount are required" });

  const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("kyc_status").eq("id", profileId).maybeSingle();
  if (profileError) return res.status(500).json({ error: profileError.message });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  if (profile.kyc_status !== "verified") return res.status(403).json({ error: "ID verification required before withdrawing" });

  const { data: ledger, error: ledgerError } = await supabaseAdmin.from("payouts").select("amount").eq("profile_id", profileId).neq("status", "failed");
  if (ledgerError) return res.status(500).json({ error: ledgerError.message });
  const availableBalance = (ledger ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  if (amount > availableBalance) return res.status(400).json({ error: "Amount exceeds available balance" });

  const { data: method, error: methodError } = await supabaseAdmin
    .from("payout_methods")
    .select("msisdn")
    .eq("profile_id", profileId)
    .eq("provider", "mtn")
    .maybeSingle();
  if (methodError) return res.status(500).json({ error: methodError.message });
  const msisdn = normalizeMsisdn(method?.msisdn);
  if (!isValidUgandaMsisdn(msisdn)) return res.status(422).json({ code: "no_payout_method", error: "Add a valid MTN MoMo number in Settings first" });

  const eurAmount = toEurSandboxAmount(amount);
  const referenceId = randomUUID();

  const { data: payout, error: payoutError } = await supabaseAdmin
    .from("payouts")
    .insert({
      profile_id: profileId,
      kind: "withdrawal",
      amount: -amount,
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
      payerMessage: "Kazify withdrawal",
      payeeNote: "Kazify withdrawal",
    });
  } catch (err) {
    await supabaseAdmin.from("payouts").update({ status: "failed", momo_disbursement_resolved_at: new Date().toISOString() }).eq("id", payout.id);
    return res.status(502).json({ error: "MTN transfer failed: " + err.message, payoutId: payout.id });
  }

  return res.status(202).json({ payoutId: payout.id, referenceId, momoStatus: "PENDING" });
}
