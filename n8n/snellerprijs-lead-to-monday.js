// n8n Code node — normalize progressive Snelle Prijs events for a Monday upsert.
// Required workflow after this node:
// 1) Search item by columns.session_id, 2) update if found, 3) create if missing.

const input = $input.first().json;
const request = input.request || input.body || input;
const config = input._privateCrm || {};
const contact = request.contact || {};
const consent = request.consent || {};
const sessionColumnId = config.session_column_id;

if (!request.session_id) throw new Error('session_id is required');
if (!sessionColumnId) throw new Error('_privateCrm.session_column_id is required');
if (!contact.name || !contact.email) throw new Error('Name and email are required');
if (request.stage !== 'email_captured' && !contact.phone) {
  throw new Error('Phone is required after email_captured');
}

const productSummary = (request.products || [])
  .filter(product => Number(product.quantity) > 0)
  .map(product => `${product.type} × ${product.quantity}`)
  .join(', ');

const notes = [
  'Source: RamenSpecialist.com / Snelle Prijs',
  `Schema: ${request.schema_version || 'unknown'}`,
  `Stage: ${request.stage || 'unknown'}`,
  `Status: ${request.status || 'cold_lead'}`,
  `Language: ${(request.language || 'nl').toUpperCase()}`,
  `Email: ${contact.email}`,
  contact.phone ? `Phone: ${contact.phone}` : '',
  `Municipality: ${request.project?.postcode || ''} ${request.project?.municipality || ''}`.trim(),
  `Products: ${productSummary || 'not specified'}`,
  `Profile: ${request.options?.profile || 'not specified'}`,
  `Glazing: ${request.options?.glazing || 'not specified'}`,
  `Colour: ${request.options?.colour || 'not specified'}`,
  `Shutters: ${request.options?.shutter || 'none'} × ${request.options?.shutter_quantity || 0}`,
  `Mosquito screens: ${request.options?.mosquito_screen_quantity || 0}`,
  `Ventilation: ${request.options?.ventilation_type || 'none'} × ${request.options?.ventilation_quantity || 0}`,
  `VAT choice: ${request.project?.vat_choice || 'not specified'}`,
  `Manual review: ${request.manual_review ? 'yes' : 'no'}`,
  `Marketing consent: ${consent.marketing_personalisation ? 'yes' : 'no'}`,
  `Partner sharing: ${consent.partner_sharing ? 'yes' : 'no'}`,
  request.calculation_id ? `Calculation ID: ${request.calculation_id}` : '',
  contact.notes ? `Customer note: ${contact.notes}` : '',
].filter(Boolean).join('\n');

const responsible = config.responsible_user_id
  ? { personsAndTeams: [{ id: Number(config.responsible_user_id), kind: 'person' }] }
  : undefined;

const mondayStatus = request.status === 'warm_lead' ? 'Qualified' : 'New';

return [{
  json: {
    operation: 'upsert_by_session_id',
    board_id: Number(config.board_id || 5094961739),
    group_id: config.group_id || 'group_mm8ajwxd',
    item_name: contact.name,
    lookup: {
      column_id: sessionColumnId,
      value: request.session_id,
      request_id: request.request_id || null,
    },
    columns: {
      [sessionColumnId]: request.session_id,
      text_mm46q9fr: contact.phone || '',
      text_mm13cpfw: `${request.project?.postcode || ''} ${request.project?.municipality || ''}`.trim(),
      color_mm13wph8: { label: mondayStatus },
      color_mm19pvxq: { label: request.manual_review ? 'High' : 'Medium' },
      color_mm2kymm2: { label: request.project?.vat_choice === 'renovation_6' ? '6%' : '21%' },
      text_mm13wjwd: notes,
      ...(responsible ? { multiple_person_mm14dsgg: responsible } : {}),
    },
    metadata: {
      session_id: request.session_id,
      request_id: request.request_id || '',
      stage: request.stage || '',
      email: contact.email.trim().toLowerCase(),
      phone: (contact.phone || '').trim(),
      postcode: request.project?.postcode || '',
      municipality: request.project?.municipality || '',
      language: request.language || 'nl',
      marketing_consent: Boolean(consent.marketing_personalisation),
      marketing_consent_at: consent.marketing_consented_at || '',
      partner_sharing: Boolean(consent.partner_sharing),
      calculation_id: request.calculation_id || '',
      last_activity: request.submitted_at || request.updated_at || new Date().toISOString(),
    },
    dedupe: {
      primary: request.session_id,
      event: request.request_id || null,
      email: contact.email.trim().toLowerCase(),
      phone: (contact.phone || '').replace(/\D/g, ''),
    },
  },
}];
