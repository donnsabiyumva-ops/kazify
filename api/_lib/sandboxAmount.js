// MTN's sandbox target environment only accepts currency=EUR — it has
// nothing to do with real-world UGX/EUR exchange rates. This produces a
// plausible non-zero EUR figure purely so the sandbox call has a well-formed
// amount; it is never written to orders.amount/total_amount or
// payouts.amount (the UGX figures there remain the only amounts of record),
// only to the audit-only momo_sandbox_amount column.
export function toEurSandboxAmount(ugxAmount) {
  const eur = Math.round(Number(ugxAmount) / 1000);
  return Math.max(1, eur);
}
