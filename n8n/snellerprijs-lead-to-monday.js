// n8n Code node — normalize an explicitly submitted Snelle Prijs lead for Monday.
// Next node: Monday.com "Create item" using the returned board/group/name/columns.

const input = $input.first().json;
const request = input.request || input.body || input;
const config = input._privateCrm || {};
const contact = request.contact || {};

if (!contact.name || !contact.phone || !contact.email) {
  throw new Error('Name, phone and email are required');
}

const productSummary = (request.products || [])
  .filter(product => Number(product.quantity) > 0)
  .map(product => `${product.type} × ${product.quantity}`)
  .join(', ');

const estimate = request.estimate?.low && request.estimate?.high
  ? `€${request.estimate.low}–€${request.estimate.high}`
  : 'not available';

const notes = [
  'Source: RamenSpecialist.com / Snelle Prijs',
  `Language: ${(request.language || 'nl').toUpperCase()}`,
  `Email: ${contact.email}`,
  `Municipality: ${request.project?.postcode || ''} ${request.project?.municipality || ''}`.trim(),
  `Products: ${productSummary || 'not specified'}`,
  `Profile: ${request.options?.profile || 'not specified'}`,
  `Glazing: ${request.options?.glazing || 'not specified'}`,
  `Colour: ${request.options?.colour || 'not specified'}`,
  `Shutters: ${request.options?.shutter || 'none'} × ${request.options?.shutter_quantity || 0}`,
  `Mosquito screens: ${request.options?.mosquito_screen_quantity || 0}`,
  `Ventilation: ${request.options?.ventilation ? 'yes' : 'no'}`,
  `VAT choice: ${request.project?.vat_choice || 'not specified'}`,
  `Displayed estimate: ${estimate}`,
  `Manual review: ${request.manual_review ? 'yes' : 'no'}`,
  contact.notes ? `Customer note: ${contact.notes}` : '',
].filter(Boolean).join('\n');

const responsible = config.responsible_user_id
  ? { personsAndTeams: [{ id: Number(config.responsible_user_id), kind: 'person' }] }
  : undefined;

return [{
  json: {
    board_id: Number(config.board_id || 5094961739),
    group_id: config.group_id || 'group_mm8ajwxd',
    item_name: contact.name,
    columns: {
      text_mm46q9fr: contact.phone,
      text_mm13cpfw: `${request.project?.postcode || ''} ${request.project?.municipality || ''}`.trim(),
      color_mm13wph8: { label: 'New' },
      color_mm19pvxq: { label: request.manual_review ? 'High' : 'Medium' },
      color_mm2kymm2: { label: request.project?.vat_choice === 'renovation_6' ? '6%' : '21%' },
      text_mm13wjwd: notes,
      ...(responsible ? { multiple_person_mm14dsgg: responsible } : {}),
    },
    dedupe: {
      phone: contact.phone.replace(/\D/g, ''),
      email: contact.email.trim().toLowerCase(),
    },
  },
}];
