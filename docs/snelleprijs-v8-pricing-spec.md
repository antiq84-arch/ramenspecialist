# Snelle Prijs v8 — pricing and UX specification

## Status

Working specification for the next calculator version. The public frontend must not contain factory prices, margins, or supplier-specific price rules. It sends a normalized request to an n8n webhook and receives only the customer-facing estimate.

## Confirmed commercial rules

- Placement is always included.
- Placement: EUR 130/m2 of total product area, with a EUR 350 minimum per complete order.
- VAT: 6% only when the legal renovation conditions are met; otherwise 21%.
- Budget reference system: Salamander GreenEvo 76 2D. Aluplast Ideal 4000 is a backup system, not a second public price choice.
- The result is indicative and displayed as a realistic range, not as an exact binding quote.
- Factory prices, supplier names, margins and internal coefficients stay in n8n environment/configuration and never in the HTML response.

## Reference dimensions from the quotation corpus

| Public product type | Calculator reference | Corpus signal |
|---|---:|---|
| Fixed window | 1000 x 1500 mm | Standard fixed reference; panoramic fixed is separate |
| One-sash tilt-turn | 1000 x 1500 mm | Median corpus area approximately 1.34 m2 |
| Two-sash | 1700 x 1450 mm | Median corpus approximately 1660 x 1420 mm |
| Three-sash | 2300 x 1300 mm | Median corpus approximately 2210 x 1256 mm |
| Panoramic fixed | 1400 x 2150 mm | Separate from a standard fixed window |
| Entrance/back door | 1000 x 2150 mm | Median corpus approximately 1017 x 2145 mm |
| Sliding system | 3200 x 2100 mm | Corpus and live price reference approximately 3160 x 2100 mm |
| Sectional garage door | 2500 x 2125 mm | Provisional until a live supplier check is completed |

## Verified price anchors

Exact supplier cost anchors are intentionally excluded from this public repository. They are stored only in the private n8n pricing node. The following configurations have been checked in the supplier calculator or in actual supplier quotations:

- GreenEvo 76 2D fixed, white, double glazing, 1000 x 1500 mm.
- GreenEvo 76 2D tilt-turn, ROTO NX, white, double glazing, 1000 x 1500 mm.
- GreenEvo 76 2D two-sash configurations from a real ten-position quotation.
- EvolutionDrive Plus Smart two-panel sliding system, 3200 x 2100 mm.
- Adaptive exterior roller shutter at approximately 1456 x 1570 mm.
- Mosquito screens in small, standard and large sizes.

## Calculation model

Do not use a single EUR/m2 rate for window products. Construction and hardware have a large fixed component.

```text
product subtotal = sum(
  construction base
  x size curve
  + glass option
  + colour option
  + safety glass
  + warm edge
  + ventilation
  + shutter
  + mosquito screen
)

commercial products = product subtotal x internal commercial coefficient
placement = max(total product area x 130, 350)
estimate excl. VAT = commercial products + placement + project surcharges
estimate incl. VAT = estimate excl. VAT x (1.06 or 1.21)
public range = rounded controlled interval around estimate
```

### Size curve

For each construction type use its own verified reference price and reference area. Apply a bounded non-linear area correction instead of direct proportional scaling:

```text
size factor = clamp((actual area / reference area) ^ 0.72, 0.72, 1.55)
```

When the customer selects only a category and not exact dimensions, use the reference dimensions above. The detailed configurator remains the route for exact per-element dimensions.

## Required questions

1. Project: house or apartment, postcode/municipality, renovation eligibility.
2. Elements: fixed, one-sash, two-sash, three-sash, panoramic fixed, door, sliding system, garage door; quantity for each.
3. Options: double/triple glass, white/colour outside/colour both sides, shutters, mosquito screens, ventilation.
4. Contact: name, phone and email, progressively collected. Do not block the first product interaction with a large lead form.

Placement is not a yes/no question. It is always included. For apartments ask floor and lift because access can create a surcharge that requires manual review.

## Options still requiring manual review

- Crane or glass robot.
- Difficult access, parking restriction or upper floor without a usable lift.
- Interior finishing, plastering, sills and major reveal repair.
- Special shapes, oversized glass and structural work.
- Safety glass where dimensions/location make it legally or technically necessary.
- Electrical work for shutters.

If any of these are selected, keep the estimate but add `manual_review: true` and explain that the final amount follows after measurement.

## Result presentation

- Show one main range inclusive of the selected VAT rate.
- Directly below: `Inclusief plaatsing en afvoer van oude ramen`.
- Show the VAT assumption clearly and let the customer correct it.
- Use a controlled range of approximately -7% to +10%, rounded to EUR 50. Do not multiply one uncertainty factor by another.
- Never show factory subtotal, margin, supplier or internal coefficients.
- CTA: `Ontvang mijn berekening en gratis opmeting`.

## Test scenarios

These are regression checks for the private engine, not advertised prices:

| Scenario | Expected behavior |
|---|---|
| One reference tilt-turn window | Placement minimum EUR 350 applies |
| One reference two-sash window | Placement minimum EUR 350 applies |
| Two-sash + shutter + screen | Options are added before the commercial coefficient; placement is charged once |
| Five two-sash windows | EUR 130/m2 exceeds the minimum and is used once for total order area |
| Sliding system 3200 x 2100 | Uses its own construction anchor, not a window EUR/m2 price |
| No products selected | No price; prompt to add at least one element |

## Frontend-to-n8n contract

Request example:

```json
{
  "language": "nl",
  "project": {
    "building_type": "house",
    "postcode": "2000",
    "vat_choice": "renovation_6",
    "floor": 0,
    "lift": false
  },
  "products": [
    {"type": "two_sash", "quantity": 3},
    {"type": "fixed", "quantity": 2}
  ],
  "options": {
    "glazing": "double",
    "colour": "white",
    "shutter": "none",
    "mosquito_screen": false,
    "ventilation": false
  }
}
```

Response example:

```json
{
  "ok": true,
  "currency": "EUR",
  "vat_rate": 0.06,
  "price_low_incl_vat": 3900,
  "price_high_incl_vat": 4650,
  "placement_included": true,
  "manual_review": false,
  "assumptions": [
    "Standaard referentiematen gebruikt",
    "Plaatsing en afvoer inbegrepen",
    "6% btw onder voorbehoud van wettelijke voorwaarden"
  ]
}
```

## Known issues in the current v3 calculator

- Internal factory prices and margins are visible in the browser source.
- Placement uses EUR 100/m2 and EUR 300 minimum instead of the confirmed EUR 130/m2 and EUR 350 minimum.
- Product categories are vague sizes rather than recognizable window constructions.
- The price range compounds multiple uplifts and becomes unnecessarily wide.
- Random live-viewer and quote counters create unverifiable social proof and must be replaced by a real cumulative number or neutral trust copy.
- The lead is logged to the browser console instead of being sent safely to n8n/Monday.
- The UI reveals all remaining steps at once after step one, so the progress indicator does not reflect the actual flow.

