module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "dailytips-payments",
    mercadoPagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN),
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    siteUrl: process.env.SITE_URL || "https://dailytips.lat"
  });
};
