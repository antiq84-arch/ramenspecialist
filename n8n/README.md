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
  "ventilation": { "glass": null, "profile": null },
  "ventilation_each": null,
  "commercial_coefficient": null,
  "upper_floor_review_allowance": 0
}
```

## Lead webhook

After the customer explicitly submits the contact form, create or update a Monday item in **Cold Leads**. Save the chosen language, contact data, product quantities, options, VAT assumption, displayed range, source and `manual_review`.

The existing Monday destination was verified on 5 November 2026:

- Board: `Lead / Follow up` (`5094961739`)
- Group: `Cold lead` (`group_mm8ajwxd`)
- Initial status: `New`
- Priority: `Medium`, or `High` when `manual_review` is true

Use `snellerprijs-lead-to-monday.js` before the Monday Create/Update Item node. Search by normalized phone and email before creating an item, so repeat calculations update the same lead instead of creating duplicates.

When `delivery.email_estimate_pdf` is `true`, the lead workflow must also:

1. retrieve the trusted calculation by `calculation_id` from the n8n Data Store;
2. build an NL/FR/EN HTML summary containing the selected products, options, assumptions and trusted price range;
3. convert that HTML to PDF;
4. email the PDF to `contact.email` from the verified RamenSpecialist sender;
5. record the send status in the Monday item notes.

Do not use a client-supplied price in the PDF. The public pricing workflow must store the trusted result by `calculation_id` before responding to the browser.

The current board has no dedicated Email or Lead Source column. Until these columns are approved, both values are saved in `Notes`.
