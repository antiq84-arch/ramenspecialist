# Snelle Prijs v8 — n8n wiring

## Public pricing webhook

1. **Webhook** receives the calculator request.
2. **Set / Code — Private Pricing Config** adds `_privatePricing`. This node is private and contains the verified anchors and coefficients.
3. **Code — Pricing Engine** uses `snellerprijs-pricing-code.js`.
4. **Set — Public Response** returns only:
   - `ok`
   - `currency`
   - `vat_rate`
   - `price_low_incl_vat`
   - `price_high_incl_vat`
   - `placement_included`
   - `manual_review`
   - `assumptions`
   - `calculation_version`
5. **Respond to Webhook** sends the public response. Never send `_internal` or `_privatePricing`.

## Private configuration shape

Store real values only inside n8n credentials, variables or a protected node. Do not commit them to GitHub.

```json
{
  "constructions": {
    "fixed": { "base": null },
    "tilt_turn": { "base": null },
    "two_sash": { "base": null },
    "three_sash": { "base": null },
    "panoramic_fixed": { "base": null },
    "sliding": { "base": null },
    "door": { "base": null },
    "garage": { "base": null }
  },
  "profile_optimal_factor": null,
  "triple_glazing_per_m2": null,
  "colour_outside_factor": null,
  "colour_both_factor": null,
  "shutters": { "surface": null, "built_in": null },
  "mosquito_screen_each": null,
  "ventilation_each": null,
  "commercial_coefficient": null,
  "upper_floor_review_allowance": 0
}
```

## Lead webhook

After the customer explicitly submits the contact form, create or update a Monday item in **Cold Leads**. Save the chosen language, contact data, product quantities, options, VAT assumption, displayed range, source and `manual_review`.
