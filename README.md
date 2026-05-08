# AI Pet Store - Updated Single Product Website

## Files
- `index.html` - main landing page
- `checkout.html` - address details page
- `success.html` - payment success page
- `style.css` - full styling
- `assets/pet1.jpg` - main product image
- `wrangler.jsonc` - Cloudflare Workers static assets config

## How to edit
- Replace `assets/pet1.jpg` with your real product image
- Update price and text directly in `index.html` and `checkout.html`
- Replace WhatsApp number in `success.html`
- Add policy links in footer

## Cloudflare deploy
Use this in repo folder:

```bash
npx wrangler login
npx wrangler deploy
```
