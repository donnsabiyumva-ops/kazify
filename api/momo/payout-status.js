import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { getTransferStatus } from "../_lib/momoClient.js";

// Shared poll endpoint for both release-escrow.js (kind: 'escrow_release')
// and withdraw.js (kind: 'withdrawal'). Only on SUCCESSFUL does an
// escrow_release payout actually flip the order's escrow_status to
// 'released' — that's the point at which the seller has really been paid.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { payoutId } = req.query;
  if (!payoutId) return res.status(400).json({ error: "payoutId is required" });

  const { data: payout, error } = await supabaseAdmin
    .from("payouts")
    .select("id, profile_id, kind, order_id, amount, status, momo_disbursement_reference_id, order:orders(gig:gigs(title))")
    .eq("id", payoutId)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!payout) return res.status(404).json({ error: "Payout not found" });

  if (payout.status !== "pending") {
    return res.status(200).json({ payoutId: payout.id, status: payout.status, momoStatus: payout.status === "completed" ? "SUCCESSFUL" : "FAILED" });
  }

  let momoStatus;
  try {
    const result = await getTransferStatus(payout.momo_disbursement_reference_id);
    momoStatus = result.status;
  } catch (err) {
    return res.status(502).json({ error: "MTN status check failed: " + err.message });
  }

  if (momoStatus === "SUCCESSFUL") {
    await supabaseAdmin.from("payouts").update({ status: "completed", momo_disbursement_resolved_at: new Date().toISOString() }).eq("id", payout.id);

    if (payout.kind === "escrow_release" && payout.order_id) {
      await supabaseAdmin.from("orders").update({ escrow_status: "released" }).eq("id", payout.order_id);
      await supabaseAdmin.from("notifications").insert({
        profile_id: payout.profile_id,
        role_context: "selling",
        kind: "escrow_released",
        title: `Approved: ${payout.order?.gig?.title ?? "your order"} — escrow released to your balance`,
        payload: { order_id: payout.order_id },
      });
    } else {
      await supabaseAdmin.from("notifications").insert({
        profile_id: payout.profile_id,
        role_context: "selling",
        kind: "payout_completed",
        title: `Withdrawal completed`,
        payload: { payout_id: payout.id },
      });
    }

    return res.status(200).json({ payoutId: payout.id, status: "completed", momoStatus: "SUCCESSFUL" });
  }

  if (momoStatus === "FAILED") {
    await supabaseAdmin.from("payouts").update({ status: "failed", momo_disbursement_resolved_at: new Date().toISOString() }).eq("id", payout.id);
    return res.status(200).json({ payoutId: payout.id, status: "failed", momoStatus: "FAILED" });
  }

  return res.status(200).json({ payoutId: payout.id, status: "pending", momoStatus: "PENDING" });
}
