// Vercel serverless function: POST /api/product-enquiry
// Forwards the enquiry to Make.com. The webhook URL lives ONLY in the
// MAKE_WEBHOOK_URL environment variable (never in browser code).

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean = (v, max = 2000) => String(v ?? "").trim().slice(0, max);

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({
      ok: false,
      code: "NOT_CONFIGURED",
      error: "Server configuration error: MAKE_WEBHOOK_URL is not set. Your enquiry was NOT sent.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: bots fill this hidden field. Pretend success, send nothing.
  if (clean(body.website)) return res.status(200).json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const product = clean(body.product, 200);
  const budget = clean(body.budget, 100);
  const message = clean(body.message, 3000);

  const errors = {};
  if (!name) errors.name = "Please enter your name.";
  if (!isEmail(email)) errors.email = "Please enter a valid email address.";
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!product) errors.product = "Please choose a product.";
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, code: "VALIDATION", errors });
  }

  // Exact field names expected by Make (JSON only)
  const payload = {
    "Customer Name": name,
    "Email": email,
    "Phone": phone,
    "Product Interested In": product,
    "Budget": budget,
    "Customer Message": message,
    "Lead Source": "Product Page",
    "Submission Date": new Date().toISOString(),
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!r.ok) {
      console.error("Make webhook responded", r.status);
      return res.status(502).json({ ok: false, error: "We could not deliver your enquiry. Please try again shortly." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Make webhook failed:", err && err.message);
    return res.status(502).json({ ok: false, error: "We could not reach our system. Please try again shortly." });
  } finally {
    clearTimeout(timer);
  }
};
