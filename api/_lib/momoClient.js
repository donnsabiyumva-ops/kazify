// Thin wrapper around MTN MoMo's sandbox Disbursements API ("transfer") —
// used to pay a seller out on escrow release and on withdrawal. Collections
// (funding escrow) isn't wired up here: that product wasn't available on
// the developer portal, so funding stays on the existing simulated flow
// until it is. Re-adding it later is mechanical — mirror transfer/
// getTransferStatus below against /collection/v1_0/requesttopay with its
// own subscription key + separately-provisioned API user/API key.

const BASE_URL = process.env.MTN_SANDBOX_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
const TARGET_ENVIRONMENT = process.env.MTN_TARGET_ENVIRONMENT || "sandbox";

const CREDENTIALS = {
  disbursement: {
    subscriptionKey: process.env.MTN_DISBURSEMENTS_SUBSCRIPTION_KEY,
    apiUser: process.env.MTN_DISBURSEMENTS_API_USER,
    apiKey: process.env.MTN_DISBURSEMENTS_API_KEY,
  },
};

function creds(product) {
  const c = CREDENTIALS[product];
  if (!c?.subscriptionKey || !c?.apiUser || !c?.apiKey) {
    throw new Error(`MTN ${product} credentials are not configured`);
  }
  return c;
}

async function getAccessToken(product) {
  const { subscriptionKey, apiUser, apiKey } = creds(product);
  const basic = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  const res = await fetch(`${BASE_URL}/${product}/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
    // MTN's sandbox 411s on a bodyless POST here (confirmed empirically) —
    // it wants a Content-Length header, which fetch only sets when a body
    // is present, even an empty one.
    body: "",
  });
  if (!res.ok) throw new Error(`MTN ${product} token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function submitPayment(product, endpoint, { referenceId, amountEur, externalId, msisdn, payerMessage, payeeNote, partyField }) {
  const { subscriptionKey } = creds(product);
  const token = await getAccessToken(product);

  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": TARGET_ENVIRONMENT,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(amountEur),
      currency: "EUR",
      externalId,
      [partyField]: { partyIdType: "MSISDN", partyId: msisdn },
      payerMessage,
      payeeNote,
    }),
  });
  if (!res.ok) throw new Error(`MTN ${product} ${endpoint} failed: ${res.status} ${await res.text()}`);
}

async function getPaymentStatus(product, endpoint, referenceId) {
  const { subscriptionKey } = creds(product);
  const token = await getAccessToken(product);

  const res = await fetch(`${BASE_URL}/${endpoint}/${referenceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "X-Target-Environment": TARGET_ENVIRONMENT,
    },
  });
  if (!res.ok) throw new Error(`MTN ${product} ${endpoint} status check failed: ${res.status} ${await res.text()}`);
  return res.json(); // { status: "PENDING" | "SUCCESSFUL" | "FAILED", ... }
}

export function transfer(params) {
  return submitPayment("disbursement", "disbursement/v1_0/transfer", { ...params, partyField: "payee" });
}

export function getTransferStatus(referenceId) {
  return getPaymentStatus("disbursement", "disbursement/v1_0/transfer", referenceId);
}
