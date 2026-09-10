import { supabaseAdmin } from "../_lib/supabaseAdmin.js";
import { getRequestToPayStatus } from "../_lib/momoClient.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { orderId } = req.query;
  if (!orderId) return res.status(400).json({ error: "orderId is required" });

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, seller_id, escrow_status, momo_collection_reference_id, momo_collection_status, gig:gigs(title)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // Already resolved — don't re-poll MTN or re-fire the notification.
  if (order.momo_collection_status !== "PENDING") {
    return res.status(200).json({ orderId: order.id, escrowStatus: order.escrow_status, momoStatus: order.momo_collection_status });
  }

  let momoStatus;
  try {
    const result = await getRequestToPayStatus(order.momo_collection_reference_id);
    momoStatus = result.status;
  } catch (err) {
    return res.status(502).json({ error: "MTN status check failed: " + err.message });
  }

  if (momoStatus === "SUCCESSFUL") {
    await supabaseAdmin
      .from("orders")
      .update({ escrow_status: "held", momo_collection_status: "SUCCESSFUL", momo_collection_resolved_at: new Date().toISOString() })
      .eq("id", order.id);
    await supabaseAdmin.from("notifications").insert({
      profile_id: order.seller_id,
      role_context: "selling",
      kind: "order_new",
      title: `New order: ${order.gig?.title ?? "your gig"}`,
      payload: { order_id: order.id },
    });
    return res.status(200).json({ orderId: order.id, escrowStatus: "held", momoStatus: "SUCCESSFUL" });
  }

  if (momoStatus === "FAILED") {
    await supabaseAdmin
      .from("orders")
      .update({ momo_collection_status: "FAILED", momo_collection_resolved_at: new Date().toISOString() })
      .eq("id", order.id);
    return res.status(200).json({ orderId: order.id, escrowStatus: order.escrow_status, momoStatus: "FAILED" });
  }

  return res.status(200).json({ orderId: order.id, escrowStatus: order.escrow_status, momoStatus: "PENDING" });
}
