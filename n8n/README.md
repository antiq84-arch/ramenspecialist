# Snelle Prijs v8 — n8n wiring

## Public pricing webhook

1. **Webhook** receives the calculator request.
2. **Set — Server Calculation ID** creates `_serverCalculationId` from the private n8n execution ID.
3. **Set / Code — Private Pricing Config** adds `_privatePricing`. This node is private and contains the verified anchors and coefficients.
4. **Code — Pricing Engine** uses `snellerprijs-pricing-code.js`.
5. **Data Table — Calculations** persists the trusted request and result by `calculation_id`.
6. **Set — Public Response** returns only:
   - `ok`
   - `currency`
   - `vat_rate`
   - `price_low_incl_vat`
   - `price_high_incl_vat`
   - `placement_included`
   - `manual_review`
   - `assumptions`
   - `calculation_version`
7. **Respond to Webhook** sends the public response. Never send `_internal` or `_privatePricing`.

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
  "ventilation": { "glass": null, "profile": null },
  "ventilation_each": null,
  "commercial_coefficient": null,
  "upper_floor_review_allowance": 0
}
```

## Lead webhook

Progress events create or update one Monday item in **CRM & Leads - Ramen en Deuren**, group **Leads**. The real board and column IDs are centralized in `snellerprijs-lead-to-monday.js`.

The Monday destination was read from the live board on 12 November 2026:

- Board: `CRM & Leads - Ramen en Deuren` (`5107699907`)
- Group: `Leads` (`topics`)
- Initial status: `New`

Use `snellerprijs-lead-to-monday.js` and search by Session ID. Follow `snellerprijs-workflow-contract.md` for the lock, retry-search and protected-update rules.

When `delivery.email_estimate_pdf` is `true`, the lead workflow must also:

1. retrieve the trusted calculation by `calculation_id` from the n8n Data Store;
2. build an NL/FR/EN HTML summary containing the selected products, options, assumptions and trusted price range;
3. convert that HTML to PDF;
4. email the PDF to `contact.email` from the verified RamenSpecialist sender;
5. record the send status in the Monday item notes.

Do not use a client-supplied price in the PDF. The public pricing workflow must store the trusted result by `calculation_id` before responding to the browser.

The board has dedicated typed columns for e-mail, phone, source, prices, consent and PDF delivery.
