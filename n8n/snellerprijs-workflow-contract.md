# Snelle Prijs n8n workflow contract

## Pricing workflow

1. Webhook validates `schema_version: snelleprijs-1.2`.
2. Set `_serverCalculationId` to `sp-{{$execution.id}}-{{$now.toMillis()}}`.
3. Add the private pricing configuration from n8n credentials/variables.
4. Run `snellerprijs-pricing-code.js`.
5. Data Table **Calculations**: upsert by `calculation_id`; store the complete trusted result and the request needed for the PDF.
6. Return only the allow-listed public pricing response. Never return `_internal` or private configuration.

## Lead/Monday workflow

1. Webhook accepts the existing public `snelleprijs-1.2` contract.
2. For `calculation_completed`, retrieve the trusted calculation by `calculation_id`. A missing/mismatched record is treated as unavailable.
3. Run `snellerprijs-lead-to-monday.js` with `_deliveryResult.email_sent:false`.
4. Data Table **Lead locks**: insert `session_id` as a unique key. On conflict wait 750 ms and repeat the Monday search. This serializes parallel progress events.
5. Search board `5107699907` by Session ID column `text_mm91qrse`.
6. Run `snellerprijs-monday-upsert.js` with the search result.
7. IF `action=update`, change only `column_values`. IF `action=create`, create in group `topics`.
8. A create must be followed by another Session ID search. If another execution won the lock, update the found item instead of creating a second item.
9. Release the Data Table lock after success or in the error branch. Expire abandoned locks after 60 seconds.
10. For a PDF request, generate and send the PDF. Only after the mail provider returns success, rerun the Monday normalizer with `_deliveryResult.email_sent:true` and update Status/Leadfase/PDF fields.

### Protected update fields

Never include these in ordinary update payloads: Manager, Aangemaakt op, manually advanced Status, Priority. `Laatste activiteit` is updated on every accepted event. `Berekening verzonden` and `Berekening voltooid` are set only after trusted pricing and confirmed PDF delivery.

### Monday column JSON

- phone: `{"phone":"+324...","countryShortName":"BE"}`
- email: `{"email":"a@b.be","text":"a@b.be"}`
- long text: `{"text":"..."}`
- status: `{"label":"New"}`
- dropdown: `{"labels":["NL"]}`
- numbers: string number
- checkbox: `{"checked":"true"}`
- date: `{"date":"YYYY-MM-DD"}`
- people: `{"personsAndTeams":[{"id":100544762,"kind":"person"}]}`

## Deployment

The public host publishes only the website allow-list. Exclude `n8n/`, `docs/`, `.git/`, tests and source notes from the deploy artifact.
