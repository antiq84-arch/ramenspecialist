// Public workflow URLs only. Pricing rules and credentials remain server-side in n8n.
window.RS_CONFIG = {
  pricingEndpoint: 'https://ramen-n8n.duckdns.org/webhook/pricing-calculator',
  leadEndpoint: 'https://ramen-n8n.duckdns.org/webhook/lead-handler',
  version: '1.2.0',
  debug: false,
  ...(window.RS_CONFIG || {})
};

// Backward-compatible globals used by the current calculator bundle.
window.RS_PRICING_ENDPOINT = window.RS_PRICING_ENDPOINT || window.RS_CONFIG.pricingEndpoint;
window.RS_LEAD_ENDPOINT = window.RS_LEAD_ENDPOINT || window.RS_CONFIG.leadEndpoint;
