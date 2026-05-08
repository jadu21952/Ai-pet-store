export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return jsonResponse(
        { error: "Razorpay keys are not configured in Cloudflare Pages environment variables." },
        500
      );
    }

    const body = await request.json();
    const edition = body?.edition === "girl" ? "girl" : "boy";
    const amount = 399900;

    const payload = {
      amount,
      currency: "INR",
      receipt: `aipet_${edition}_${Date.now()}`,
      notes: {
        edition,
        customer_name: body?.customer?.name || "",
        mobile: body?.customer?.mobile || "",
        city: body?.customer?.city || "",
        selected_method: body?.selectedMethod || "upi"
      }
    };

    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return jsonResponse(
        { error: data?.error?.description || "Unable to create Razorpay order." },
        500
      );
    }

    return jsonResponse({
      key: env.RAZORPAY_KEY_ID,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      edition,
      editionLabel: edition === "girl" ? "Girl Edition" : "Boy Edition"
    });
  } catch (error) {
    return jsonResponse(
      { error: error?.message || "Order creation failed." },
      500
    );
  }
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