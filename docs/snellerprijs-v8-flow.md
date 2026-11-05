# Snelle Prijs v8 — approved customer flow

## Goal

Give Belgian homeowners aged 30–60 a credible installed price range without making them understand window-industry jargon or surrender contact details before receiving value.

## Conversion principles

- Start with recognisable window and door constructions, not lead fields.
- Use architectural drawings to distinguish fixed, opening and sliding elements.
- Keep the indicative installed price visible after the first element is added.
- Show a range inclusive of the selected VAT assumption.
- Installation is always included and is never presented as an optional checkbox.
- Do not use fake live counters, countdown promotions or unverifiable social proof.
- Contact details are requested only after the result is visible.
- Use 48 px minimum touch targets and plain Dutch labels.

## Four steps

### 1. Elementen

Products:

1. Vast raam — 1000 × 1500 mm reference
2. Draai-kiepraam — 1000 × 1500 mm reference
3. Dubbel raam — 1700 × 1450 mm reference
4. Driedelig raam — 2300 × 1300 mm reference
5. Panoramisch vast raam — 1400 × 2150 mm reference
6. Schuifraam — 3200 × 2100 mm reference
7. Buitendeur — 1000 × 2150 mm reference
8. Sectionale garagepoort — 2500 × 2125 mm reference

The drawings for the tilt-turn, double and three-part windows visibly show an opening sash. The fixed window has no opening indication. The sliding system uses overlapping panels and a horizontal direction arrow.

### 2. Uitvoering

- Product level: Budget / Optimaal. Maatwerk routes to the detailed configurator or manual advice.
- Glazing: double / triple.
- Colour: white / colour outside / colour both sides.
- Roller shutters: none / surface-mounted / built-in.
- Mosquito screens: none / selected elements.
- Ventilation: no / yes.

Keep technical brands and supplier names out of customer-facing choices.

### 3. Woning

- House or apartment.
- Apartment floor and usable lift.
- Belgian postcode.
- VAT assumption: renovation 6% under legal conditions, otherwise 21%.
- Difficult access and special work set `manual_review: true` without blocking the estimate.

### 4. Resultaat

- Show one controlled range, inclusive of selected VAT and standard installation.
- Explicitly state: `Inclusief plaatsing en afvoer van oude ramen`.
- State that the final price follows after technical measurement.
- Contact fields are for saving the calculation and requesting a free measurement, not for unlocking the displayed price.
- Primary CTA: `Ontvang mijn berekening en gratis opmeting`.

## Pricing boundary

The public HTML contains no factory prices, margins, supplier anchors or internal coefficients. It sends the normalized request to a private n8n webhook and receives only the public estimate range and assumptions. If the endpoint is unavailable, the UI must show a neutral retry state and must not silently invent a price.

## CRM boundary

After explicit submission, n8n creates or updates an item in Monday under `Cold Leads`, including language, contact data, product counts, options, price range, VAT assumption, source page and `manual_review`.
