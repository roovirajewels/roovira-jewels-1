
# Roovira Jewels — Free GitHub Pages Store (UPI/QR Checkout)

This is a **static** store template that runs on **GitHub Pages** (free). It shows products, supports a cart, and builds a **UPI deep link** for checkout. It also shows a placeholder **QR image**.

> Automatic payment verification is **not possible** on GitHub Pages (no server). The buyer taps the UPI link or scans the QR, pays, then reaches **success.html**. You confirm payments in your UPI app.

## 1) Quick Start
1. Download the ZIP and extract.
2. Replace `assets/sample-qr.png` with **your** UPI QR (same filename).
3. Open `settings.json` and set:
   ```json
   { "merchant_vpa": "your-vpa@upi", "merchant_name": "Roovira Jewels" }
   ```
4. Edit `products.json` with your items (title, price, category, image URL).
5. Open `index.html` locally to test.

## 2) Publish on GitHub Pages (free)
1. Create a **public** repo, e.g. `roovira-jewels`.
2. Upload all files at the repo root: `index.html, styles.css, app.js, products.json, settings.json, success.html, assets/…`.
3. Go to **Settings → Pages** → **Build and deployment** = `Deploy from a branch` → Branch = `main` (or `master`) / `/root`.
4. GitHub will give you a Pages URL like `https://YOUR-USER.github.io/roovira-jewels/`.
5. Visit it and test.

## 3) Connect your GoDaddy domain
- In your repo, go to **Settings → Pages → Custom domain** and add `yourdomain.com`.  
- GitHub shows the DNS records you need to set at GoDaddy. Follow those records.
- In GoDaddy: **Domains → DNS** → Add the records GitHub shows (A records for apex domain, CNAME for `www`).  
- Wait for DNS to propagate (can take up to a few hours).

> For exact DNS values, always follow GitHub’s current documentation inside **Settings → Pages** (records can change).

## 4) How checkout works
- Cart total is calculated client-side.
- We generate a **UPI deep link**: `upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE`.
- Buyer scans the QR or taps the link and pays in their UPI app.
- Buyer clicks **“I’ve Paid”** → goes to `success.html` (shows an order reference).  
- You manually verify payment in your UPI app and fulfill the order.

## 5) Optional improvements
- Add a Google Form or Typeform to collect address after payment.
- Move to a low-cost backend later (WooCommerce/Razorpay webhook) for automatic confirmation.
- Compress images and add more categories/filters.

## 6) Safety notes
- Do not store sensitive data in this static site.
- Prices are client-side, so treat this as a lightweight catalog + UPI handoff.
