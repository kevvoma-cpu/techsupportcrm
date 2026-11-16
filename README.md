# TechSupport: Laptop Product Discovery Page

A responsive lead-generation landing page for browsing laptops and sending product enquiries. It is **not** an e-commerce site: there is no cart, payment or checkout.

Enquiries are sent from the browser to this project's own API route, which forwards them to a **Make.com webhook**. The webhook URL is never exposed in browser code.

## Features
- Responsive layout (desktop, tablet, mobile) with mobile menu
- Product catalogue driven by one editable data file
- "Enquire About This Laptop" buttons that scroll to the form and pre-fill the product
- Validation, success and error messages, and duplicate-submission protection
- Server-side Make.com forwarding with a clear error if it isn't configured
- Hidden honeypot field to deter basic spam bots

## Project structure
```
index.html                 The whole page: markup, styles, product data and logic
api/
  product-enquiry.js       Serverless route: POST /api/product-enquiry
README.md                  This file
.env.example               (optional) Environment variable template
.gitignore                 (optional) Keeps secrets out of Git
```
Only `index.html` and `api/product-enquiry.js` are needed to run the site. Keep the `api` folder name and path exactly as shown, because Vercel uses it to create the endpoint.

> If your repository already has an `index.html` (for example your existing enquiry page), **do not overwrite it**. Rename this file (e.g. `products.html`) and link to it instead.

## Editing products
Open `index.html` and search for `EDIT YOUR PRODUCTS HERE`. Each product has:

| Field | Meaning |
|---|---|
| `id` | Unique ID (letters and dashes) |
| `name`, `category`, `description` | Card text |
| `processor`, `ram`, `storage`, `screen` | Specifications |
| `price` | Number in Naira, or `null` for "Contact us for price" |
| `image` | Image URL, or a path such as `img/elitebook.jpg` if you upload an `img` folder. Leave `""` to use the built-in illustration |

To add a laptop, copy a product block and give it a new `id`. Prices in the file are **indicative** market figures and must be confirmed before selling. Replace the placeholder email and phone in `TECHSUPPORT_SITE`, just below the products.

## Make.com webhook setup
1. In Make, create a scenario that starts with **Webhooks > Custom webhook** and copy its URL.
2. Set it as the environment variable `MAKE_WEBHOOK_URL`:
   - **Vercel:** Project > Settings > Environment Variables. Redeploy after adding.
   - **Local:** copy `.env.example` to `.env.local` and fill it in.
3. Never commit the real URL. `.env.local` is already in `.gitignore`.

### Payload (JSON only)
```json
{
  "Customer Name": "",
  "Email": "",
  "Phone": "",
  "Product Interested In": "",
  "Budget": "",
  "Customer Message": "",
  "Lead Source": "Product Page",
  "Submission Date": "2026-01-01T12:00:00.000Z"
}
```
`Submission Date` is an ISO timestamp set on the server. If `MAKE_WEBHOOK_URL` is missing, the API returns an error and the form tells the visitor their enquiry was **not** sent.

## Running locally
```bash
npm i -g vercel
vercel dev
```
Open the URL it prints. Opening `index.html` directly will show the page, but submissions need the API route.

## Testing the form
1. Click **Enquire About This Laptop** and confirm the product is pre-filled.
2. Submit empty and check the validation messages.
3. Submit valid details and confirm the run appears in Make.
4. Click Send twice quickly and confirm only one run appears.
5. Remove `MAKE_WEBHOOK_URL` and confirm a configuration error is shown.

## Before going live
- [ ] Set `MAKE_WEBHOOK_URL`
- [ ] Replace placeholder email and phone
- [ ] Confirm real prices and specifications
- [ ] Add real product photos (an image URL or an `img/` folder)
- [ ] Map the incoming fields in your Make scenario
- [ ] Link the page from your existing site navigation
