# Snelle Prijs — progressive lead flow

## Doel

De calculator bewaart een aanvraag stapsgewijs, zodat een bruikbare lead niet pas op de resultaatpagina ontstaat. Alle writes gebruiken dezelfde `session_id`; n8n moet daarom upserten en nooit bij iedere stap een nieuw Monday-item aanmaken.

Alle calculator- en pricing-payloads gebruiken `schema_version: snelleprijs-1.2`. De pricing-aanvraag bevat eveneens de `session_id`, zodat de serverberekening later veilig aan hetzelfde project kan worden gekoppeld.

## Events naar `RS_LEAD_ENDPOINT`

### 1. `lead_progress` / `email_captured`

Wordt verzonden wanneer stap 2 is gevalideerd. Bevat naam, e-mail, postcode, gemeente, gekozen elementen en opties, UTM/referrer en afzonderlijke toestemmingsvelden.

Monday-status: `Cold lead — calculator gestart`.

### 2. `lead_progress` / `phone_captured`

Wordt één keer per ongewijzigde combinatie verzonden vlak voor de prijsaanvraag. Bevat dezelfde `session_id`, nu aangevuld met telefoon, woningtype, btw-keuze en `manual_review` voor moeilijke toegang of extra werken.

Monday-status: `Cold lead — contact compleet`.

### 3. `lead_complete` / `calculation_completed`

Wordt verzonden wanneer de klant de PDF aanvraagt. Bevat `status: warm_lead`, het door de pricingserver uitgegeven `calculation_id`, contactgegevens, notitie, toestemmingen en de PDF-delivery-opdracht.

Monday-status: `Warm lead — berekening aangevraagd`.

## Upsert-regel

1. Zoek Monday-item op `session_id`.
2. Bestaat het: update alleen aangeleverde waarden en de laatste fase.
3. Bestaat het niet: maak één item in `Cold Leads`.
4. Gebruik `session_id` als primaire upsert-sleutel. `request_id` identificeert één afzonderlijke HTTP-event en wordt alleen gebruikt om een netwerk-retry van exact die event te herkennen.
5. De frontend voorkomt dubbele `email_captured`- en `phone_captured`-events zolang de bijbehorende contact- of projectgegevens niet veranderen.

Elke progress-event bevat daarnaast `status: cold_lead`, `source: snelleprijs-v8` en `updated_at`. De finale event bevat `status: warm_lead`, `source` en `submitted_at`.

De meegeleverde Code node `n8n/snellerprijs-lead-to-monday.js` normaliseert zowel gedeeltelijke als complete events en retourneert `operation: upsert_by_session_id`. Geef via `_privateCrm.session_column_id` de echte Monday-kolom voor Session ID mee. De daaropvolgende n8n-nodes moeten met `lookup.column_id` + `lookup.value` zoeken en daarna Update Item of Create Item uitvoeren.

## Toestemmingsvelden

- `privacy_notice_presented`: privacy-informatie werd bij de invoervelden getoond.
- `manager_contact_acknowledged`: volgt uitsluitend uit de verplicht actief aangevinkte aanvraagbevestiging.
- `request_acknowledged_at`: tijdstip waarop die aanvraagbevestiging werd aangevinkt.
- `marketing_personalisation`: afzonderlijke, niet vooraf aangevinkte toestemming voor gepersonaliseerde advertenties en vergelijkbare doelgroepen.
- `marketing_platforms`: alleen bij toestemming, momenteel `meta` en `google`.
- `marketing_consent_version`, `marketing_consented_at` en `marketing_withdrawn_at`: tekstversie en werkelijke momenten van toestemming of intrekking.
- `partner_sharing`: afzonderlijke optionele toestemming voor uitvoeringspartners.
- `partner_consented_at`: tijdstip waarop partner sharing werd aangevinkt.

Een prijs, PDF of opvolging mag nooit afhankelijk zijn van `marketing_personalisation` of `partner_sharing`.

## Monday-kolommen

`Name`, `First name`, `Email`, `Phone`, `Postcode`, `Municipality`, `Language`, `Stage`, `Products`, `Profile`, `Glazing`, `Colour`, `Shutters`, `Screens`, `Ventilation`, `Building`, `VAT`, `UTM Source`, `UTM Campaign`, `Referrer`, `Session ID`, `Calculation ID`, `Marketing consent`, `Marketing consent timestamp`, `Partner sharing`, `Last activity`.

## Advertentie-audiences

Alleen records met `marketing_personalisation = true` mogen naar Meta Custom Audiences of Google Customer Match. Hash contactgegevens server-side, log de exportdatum en verwerk een intrekking ook in de advertentieplatformen. Voeg geen Meta Pixel, Google Ads-tag of andere niet-essentiële tracking toe vóór aparte cookie-toestemming.

## Beveiliging

- Fabrieksprijzen, marges en prijsformules blijven uitsluitend in de private n8n Pricing workflow.
- De browser ontvangt alleen `price_low_incl_vat`, `price_high_incl_vat`, `calculation_id` en een beperkte status.
- Een pricingantwoord zonder server-side `calculation_id` wordt afgewezen; de browser maakt hiervoor geen vervangende ID.
- Rate-limit de pricing webhook, valideer alle hoeveelheden server-side en gebruik Turnstile voor publieke inzendingen.
- Bewaar onvoltooide leads maximaal 90 dagen en voltooide aanvragen maximaal 24 maanden, tenzij een andere wettelijke of contractuele termijn geldt.
