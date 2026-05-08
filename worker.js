export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      return createOrder(request, env);
    }

    if (url.pathname === '/api/verify-payment' && request.method === 'POST') {
      return verifyPayment(request, env);
    }

    return new Response('Not found', { status: 404 });
  }
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
});

async function createOrder(request, env) {
  try {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return json({ error: 'Razorpay keys not configured in Worker secrets.' }, 500);
    }

    const body = await request.json();
    const edition = body.edition === 'girl' ? 'girl' : 'boy';
    const amount = 399900;
    const receipt = `aipet_${edition}_${Date.now()}`;
    const payload = {
      amount,
      currency: 'INR',
      receipt,
      notes: {
        edition,
        customer_name: body?.customer?.name || '',
        mobile: body?.customer?.mobile || '',
        city: body?.customer?.city || ''
      }
    };

    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return json({ error: data?.error?.description || 'Unable to create Razorpay order.' }, 500);
    }

    return json({
      key: env.RAZORPAY_KEY_ID,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      edition,
      editionLabel: edition === 'girl' ? 'Girl Edition' : 'Boy Edition'
    });
  } catch (error) {
    return json({ error: error.message || 'Order creation failed.' }, 500);
  }
}

async function verifyPayment(request, env) {
  try {
    if (!env.RAZORPAY_KEY_SECRET) {
      return json({ error: 'Razorpay secret not configured.' }, 500);
    }

    const body = await request.json();
    const orderId = body.orderId;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return json({ error: 'Missing payment verification fields.' }, 400);
    }

    const expectedSignature = await makeSignature(`${orderId}|${paymentId}`, env.RAZORPAY_KEY_SECRET);
    if (expectedSignature !== signature) {
      return json({ ok: false, error: 'Payment signature verification failed.' }, 400);
    }

    return json({ ok: true, orderId, paymentId });
  } catch (error) {
    return json({ error: error.message || 'Verification failed.' }, 500);
  }
}

async function makeSignature(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');
}
