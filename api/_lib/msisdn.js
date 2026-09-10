// Normalizes a payout_methods.msisdn value (which may carry a leading "+",
// spaces, or a local "0…" prefix) into the bare-digits international format
// MTN's API expects (e.g. "256770014192"). Also rejects the kind of masked
// placeholder ("+256 77 •• 4192") that only ever existed for display, which
// would otherwise silently reach a live (sandbox) API call.

const UGANDA_MSISDN = /^256\d{9}$/;

export function normalizeMsisdn(raw) {
  if (!raw) return null;
  const digitsOnly = String(raw).replace(/\D/g, "");
  if (!digitsOnly) return null;

  let normalized = digitsOnly;
  if (normalized.startsWith("0")) normalized = "256" + normalized.slice(1);
  else if (!normalized.startsWith("256")) normalized = "256" + normalized;

  return normalized;
}

export function isValidUgandaMsisdn(normalized) {
  return typeof normalized === "string" && UGANDA_MSISDN.test(normalized);
}
