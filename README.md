# TechSupport: Laptop Product Discovery Page

A responsive lead-generation landing page for browsing laptops and sending product enquiries. It is **not** an e-commerce site: there is no cart, payment or checkout.

The enquiry form posts JSON **directly to a Make.com webhook**. No API route, backend or authentication is needed. The whole site is a single file.

## Features
- Responsive layout (desktop, tablet, mobile) with mobile menu
- Product catalogue driven by one editable data block
- "Enquire About This Laptop" buttons that scroll to the form and pre-fill the product
- Validation, success and error messages, and duplicate-submission protection
- Hidden honeypot field to deter basic spam bots

## Files
```
index.html    The whole site: markup, styles, product data and logic
README.md     This file
```

> If your repository already has an `index.html` (for example your existing enquiry page), **do not overwrite it**. Rename this file (e.g. `products.html`) and link to it instead.

## Editing products
Open `index.html` and search for `EDIT YOUR PRODUCTS HERE`. Each product has:

| Field | Meaning |
|---|---|
| `id` | Unique ID (letters and dashes) |
| `name`, `category`, `description` | Card text |
| `processor`, `ram`, `storage`, `screen` | Specifications |
| `price` | Number in Naira, or `null` for "Contact us for price" |
| `image` | Image URL, or a path such as `img/elitebook.jpg`. Leave `""` to use the built-in illustration |

To add a laptop, copy a product block and give it a new `id`. Prices are **indicative** market figures and must be confirmed before selling. Replace the placeholder email and phone in `TECHSUPPORT_SITE`, just below the products.

## Make.com webhook
Search `index.html` for `WEBHOOK_URL` and set it to your Make custom webhook URL. In Make, the scenario should start with **Webhooks > Custom webhook** and be switched on (or set to "Run once" while testing).

The form sends this JSON:
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
`Submission Date` is an ISO timestamp from the visitor's browser. After the first test submission, click **Redetermine data structure** on the webhook module so Make learns the fields.

> **Security note:** because the form posts straight from the browser, the webhook URL is visible in the page source. Anyone could send fake submissions to it. If you get spam, regenerate the webhook URL in Make, and consider adding a filter in the scenario (for example, require a valid email).

## Testing
1. In Make, open the scenario and click **Run once**.
2. Open the site, click **Enquire About This Laptop** and confirm the product is pre-filled.
3. Submit empty and check the validation messages.
4. Submit valid details and confirm the run appears in Make.
5. Click Send twice quickly and confirm only one run appears.

## Before going live
- [ ] Replace placeholder email and phone
- [ ] Confirm real prices and specifications
- [ ] Add real product photos
- [ ] Map the incoming fields in your Make scenario
- [ ] Link the page from your existing site navigation
