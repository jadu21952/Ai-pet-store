export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.RAZORPAY_KEY_SECRET) {
      return jsonResponse({ error: "Razorpay secret is not configured." }, 500);
    }

    const body = await request.json();

    const orderId = body?.orderId;
    const paymentId = body?.razorpay_payment_id;
    const signature = body?.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return jsonResponse({ ok: false, error: "Missing payment verification fields." }, 400);
    }

    const expectedSignature = await makeSignature(
      `${orderId}|${paymentId}`,
      env.RAZORPAY_KEY_SECRET
    );

    if (expectedSignature !== signature) {
      return jsonResponse({ ok: false, error: "Payment signature verification failed." }, 400);
    }

    return jsonResponse({ ok: true, orderId, paymentId });
  } catch (error) {
    return jsonResponse(
      { ok: false, error: error?.message || "Verification failed." },
      500
    );
  }
}

async function makeSignature(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}