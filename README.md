# AI PET Store — Cloudflare Pages Functions Version

This version is for a **Cloudflare Pages project with GitHub auto-deploy**.

## Important change
- `worker.js` has been removed.
- Razorpay backend now uses **Pages Functions**.

## Folder structure added
- `functions/api/create-order.js`
- `functions/api/verify-payment.js`

## Cloudflare dashboard setup
Go to:

**Cloudflare Dashboard → Workers & Pages → Your Pages Project → Settings → Environment variables**

Add these two variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## GitHub upload
Upload/replace these files in your repo:
- `index.html`
- `checkout.html`
- `success.html`
- `failed.html`
- `style.css`
- `script.js`
- `wrangler.jsonc`

And add this folder:
- `functions/api/`

## Do not keep
- `worker.js`

## Notes
- COD is removed.
- Payment starts only after the customer fills the checkout form and clicks **Proceed to Payment**.
- This is configured for Razorpay **test mode**.

Policy pages added: privacy-policy.html, terms-conditions.html, shipping-policy.html, refund-policy.html, contact-us.html
