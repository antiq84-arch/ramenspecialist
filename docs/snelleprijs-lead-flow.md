# Snelle Prijs — progressive lead flow

## Doel

De calculator bewaart een aanvraag stapsgewijs, zodat een bruikbare lead niet pas op de resultaatpagina ontstaat. Alle writes gebruiken dezelfde `session_id`; n8n moet daarom upserten en nooit bij iedere stap een nieuw Monday-item aanmaken.

## Events naar `RS_LEAD_ENDPOINT`

### 1. `lead_progress` / `email_captured`

Wordt verzonden wanneer stap 2 is gevalideerd. Bevat naam, e-mail, postcode, gemeente, gekozen elementen en opties, UTM/referrer en afzonderlijke toestemmingsvelden.

Monday-status: `Cold lead — calculator gestart`.

### 2. `lead_progress` / `phone_captured`

Wordt verzonden vlak voor de prijsaanvraag. Bevat dezelfde `session_id`, nu aangevuld met telefoon, woningtype, btw-keuze en toegangsinformatie.

Monday-status: `Cold lead — contact compleet`.

### 3. `lead_complete` / `calculation_completed`

Wordt verzonden wanneer de klant de PDF aanvraagt. Bevat `calculation_id`, contactgegevens, notitie, toestemmingen en de PDF-delivery-opdracht.

Monday-status: `Warm lead — berekening aangevraagd`.

## Upsert-regel

1. Zoek Monday-item op `session_id`.
2. Bestaat het: update alleen aangeleverde waarden en de laatste fase.
3. Bestaat het niet: maak één item in `Cold Leads`.
4. Bewaar `request_id` als idempotency key zodat een retry geen dubbel item maakt.

## Toestemmingsvelden

- `privacy_notice_presented`: privacy-informatie werd bij de invoervelden getoond.
- `manager_contact_acknowledged`: contact is nodig voor de aangevraagde berekening/opvolging.
- `marketing_personalisation`: afzonderlijke, niet vooraf aangevinkte toestemming voor gepersonaliseerde advertenties en vergelijkbare doelgroepen.
- `marketing_platforms`: alleen bij toestemming, momenteel `meta` en `google`.
- `marketing_consent_version` en `timestamp`: bewijs van tekstversie en tijdstip.
- `partner_sharing`: afzonderlijke optionele toestemming voor uitvoeringspartners.

Een prijs, PDF of opvolging mag nooit afhankelijk zijn van `marketing_personalisation` of `partner_sharing`.

## Monday-kolommen

`Name`, `First name`, `Email`, `Phone`, `Postcode`, `Municipality`, `Language`, `Stage`, `Products`, `Profile`, `Glazing`, `Colour`, `Shutters`, `Screens`, `Ventilation`, `Building`, `VAT`, `UTM Source`, `UTM Campaign`, `Referrer`, `Session ID`, `Calculation ID`, `Marketing consent`, `Marketing consent timestamp`, `Partner sharing`, `Last activity`.

## Advertentie-audiences

Alleen records met `marketing_personalisation = true` mogen naar Meta Custom Audiences of Google Customer Match. Hash contactgegevens server-side, log de exportdatum en verwerk een intrekking ook in de advertentieplatformen. Voeg geen Meta Pixel, Google Ads-tag of andere niet-essentiële tracking toe vóór aparte cookie-toestemming.

## Beveiliging

- Fabrieksprijzen, marges en prijsformules blijven uitsluitend in de private n8n Pricing workflow.
- De browser ontvangt alleen `price_low_incl_vat`, `price_high_incl_vat`, `calculation_id` en een beperkte status.
- Rate-limit de pricing webhook, valideer alle hoeveelheden server-side en gebruik Turnstile voor publieke inzendingen.
- Bewaar onvoltooide leads maximaal 90 dagen en voltooide aanvragen maximaal 24 maanden, tenzij een andere wettelijke of contractuele termijn geldt.
