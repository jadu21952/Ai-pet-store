const galleryData = {
  boy: ["boy-1.jpg", "boy-2.jpg", "boy-3.jpg", "boy-4.jpg", "boy-5.jpg", "boy-6.jpg"],
  girl: ["girl-1.jpg", "girl-2.jpg", "girl-3.jpg", "girl-4.jpg", "girl-5.jpg", "girl-6.jpg"]
};

const boxData = {
  boy: { device: "boy-box-device.jpg", cable: "boy-box-cable.jpg", guide: "boy-box-guide.jpg", card: "boy-box-card.jpg" },
  girl: { device: "girl-box-device.jpg", cable: "girl-box-cable.jpg", guide: "girl-box-guide.jpg", card: "girl-box-card.jpg" }
};

function updateBoxImages(edition) {
  const title = document.getElementById("boxEditionTitle");
  const device = document.getElementById("boxDeviceImage");
  const cable = document.getElementById("boxCableImage");
  const guide = document.getElementById("boxGuideImage");
  const card = document.getElementById("boxCardImage");
  if (title) title.textContent = edition === "boy" ? "Boy Edition" : "Girl Edition";
  if (device) device.src = boxData[edition].device;
  if (cable) cable.src = boxData[edition].cable;
  if (guide) guide.src = boxData[edition].guide;
  if (card) card.src = boxData[edition].card;
}

function setEdition(edition) {
  const main = document.getElementById("mainProductImage");
  const thumbs = document.getElementById("thumbColumn");
  const heroBuyBtn = document.getElementById("heroBuyBtn");
  const ctaBuyBtn = document.getElementById("ctaBuyBtn");
  const ctaImage = document.getElementById("ctaImage");
  const switchBtns = document.querySelectorAll(".switch-btn");
  const cards = document.querySelectorAll(".edition-card");
  if (heroBuyBtn) heroBuyBtn.href = `checkout.html?edition=${edition}`;
  if (ctaBuyBtn) ctaBuyBtn.href = `checkout.html?edition=${edition}`;
  if (ctaImage) ctaImage.src = galleryData[edition][3];
  switchBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.edition === edition));
  cards.forEach(card => card.classList.toggle("active", card.dataset.edition === edition));
  const links = document.querySelectorAll(".edition-link");
  links.forEach(link => {
    const card = link.closest("[data-edition]");
    if (card) link.href = `checkout.html?edition=${card.dataset.edition}`;
  });
  if (thumbs && main) {
    thumbs.innerHTML = "";
    galleryData[edition].forEach((img, idx) => {
      const btn = document.createElement("button");
      btn.className = "thumb-btn" + (idx === 0 ? " active" : "");
      btn.type = "button";
      btn.innerHTML = `<img src="${img}" alt="${edition} image ${idx + 1}">`;
      btn.addEventListener("click", () => {
        main.src = img;
        document.querySelectorAll(".thumb-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
      thumbs.appendChild(btn);
    });
    main.src = galleryData[edition][0];
  }
  updateBoxImages(edition);
}

function setupLanding() {
  const switchBtns = document.querySelectorAll(".switch-btn");
  const cards = document.querySelectorAll(".edition-card");
  switchBtns.forEach(btn => btn.addEventListener("click", () => setEdition(btn.dataset.edition)));
  cards.forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.tagName.toLowerCase() === "a") return;
      setEdition(card.dataset.edition);
      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  setEdition("boy");
}

function setPaymentMessage(message, isError = false) {
  const el = document.getElementById('paymentStatus');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.classList.toggle('success', !isError && !!message);
}

function getSelectedPaymentMethod() {
  return document.querySelector('input[name="pay"]:checked')?.value || 'upi';
}

function setupCheckout() {
  const params = new URLSearchParams(window.location.search);
  let edition = params.get('edition') || 'boy';
  const hidden = document.getElementById('selectedEdition');
  const img = document.getElementById('summaryImage');
  const title = document.getElementById('summaryTitle');
  const mini = document.querySelectorAll('.mini-switch');
  const form = document.getElementById('checkoutForm');
  const payButton = document.getElementById('payNowBtn');

  function apply(ed) {
    edition = ed;
    if (hidden) hidden.value = ed;
    if (img) img.src = `${ed}-1.jpg`;
    if (title) title.textContent = `AI PET – ${ed.charAt(0).toUpperCase() + ed.slice(1)} Edition`;
    mini.forEach(btn => btn.classList.toggle('active', btn.dataset.edition === ed));
  }

  mini.forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.edition)));
  apply(edition);

  document.querySelectorAll('.pay').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.pay').forEach(p => p.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (!form || !payButton) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (typeof window.Razorpay === 'undefined') {
      setPaymentMessage('Razorpay checkout load नहीं हुआ. कृपया page refresh करें.', true);
      return;
    }

    const formData = new FormData(form);
    const customer = {
      name: formData.get('name') || form.querySelector('input[placeholder="Enter your full name"]')?.value || '',
      mobile: form.querySelector('input[type="tel"]')?.value || '',
      email: form.querySelector('input[type="email"]')?.value || '',
      address1: form.querySelector('input[placeholder="House / Building / Street"]')?.value || '',
      address2: form.querySelector('input[placeholder="Apartment, suite, landmark"]')?.value || '',
      city: form.querySelector('input[placeholder="Enter city"]')?.value || '',
      state: form.querySelector('input[placeholder="Select state"]')?.value || '',
      pincode: form.querySelector('input[placeholder="Enter pincode"]')?.value || '',
      country: form.querySelector('input[value="India"]')?.value || 'India'
    };

    payButton.disabled = true;
    payButton.textContent = 'Opening Payment...';
    setPaymentMessage('Secure Razorpay payment खोल रहे हैं...');

    try {
      const createOrderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edition, customer, selectedMethod: getSelectedPaymentMethod() })
      });

      const orderData = await createOrderResponse.json();
      if (!createOrderResponse.ok) throw new Error(orderData.error || 'Order create नहीं हो सका.');

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI PET',
        description: `${orderData.editionLabel} Purchase`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setPaymentMessage('Payment verify कर रहे हैं...');
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                edition,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                customer
              })
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.ok) throw new Error(verifyData.error || 'Payment verify नहीं हो सका.');
            window.location.href = `success.html?edition=${edition}&order_id=${encodeURIComponent(verifyData.orderId)}&payment_id=${encodeURIComponent(verifyData.paymentId)}`;
          } catch (error) {
            setPaymentMessage(error.message || 'Payment verify नहीं हो सका.', true);
            payButton.disabled = false;
            payButton.textContent = 'Proceed to Payment';
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentMessage('Payment popup बंद कर दिया गया.', true);
            payButton.disabled = false;
            payButton.textContent = 'Proceed to Payment';
          }
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.mobile
        },
        notes: {
          edition,
          selected_method: getSelectedPaymentMethod(),
          city: customer.city,
          state: customer.state
        },
        theme: { color: '#6c63ff' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        window.location.href = 'failed.html';
      });
      rzp.open();
    } catch (error) {
      setPaymentMessage(error.message || 'Payment start नहीं हो सका.', true);
      payButton.disabled = false;
      payButton.textContent = 'Proceed to Payment';
    }
  });
}

function setupSuccess() {
  const params = new URLSearchParams(window.location.search);
  const edition = params.get('edition') || 'boy';
  const orderId = params.get('order_id');
  const paymentId = params.get('payment_id');
  const img = document.getElementById('successSummaryImage');
  const title = document.getElementById('successSummaryTitle');
  const orderEl = document.getElementById('successOrderId');
  const paymentEl = document.getElementById('successPaymentId');
  if (img) img.src = `${edition}-1.jpg`;
  if (title) title.textContent = `AI PET – ${edition.charAt(0).toUpperCase() + edition.slice(1)} Edition`;
  if (orderId && orderEl) orderEl.textContent = orderId;
  if (paymentId && paymentEl) paymentEl.textContent = paymentId;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('thumbColumn')) setupLanding();
  if (document.querySelector('.checkout-form')) setupCheckout();
  if (document.getElementById('successSummaryImage')) setupSuccess();
});
