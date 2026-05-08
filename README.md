# AI PET Store — Razorpay Test Mode Ready

This version includes:
- Smart Features section
- Box images switching for Boy/Girl editions
- Cash on Delivery removed
- Razorpay test-mode payment starts only after address/details are filled on checkout page
- Payment success goes to success page
- Payment cancel/failure goes to failed page

## Important
For safety, Razorpay secrets are NOT embedded in these files.
Set them as Cloudflare Worker secrets before deploy.

## Set Razorpay secrets
```bash
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
```

## Deploy
```bash
npx wrangler deploy
```

## Files to replace if you already have your own images
Replace these files:
- index.html
- checkout.html
- success.html
- failed.html
- style.css
- script.js
- worker.js
- wrangler.jsonc

You can keep your existing product images if their names are unchanged.
