// n8n Code node — build the trusted Snelle Prijs email/PDF summary.
// Input: { request: <lead webhook body>, trustedCalculation: <Data Store result> }
// The price must come from trustedCalculation, never from the browser request.

const input = $input.first().json;
const request = input.request || input.body || {};
const calculation = input.trustedCalculation || input.calculation;

if (!request.contact?.email || !calculation?.price_low_incl_vat || !calculation?.price_high_incl_vat) {
  throw new Error('Trusted calculation and customer email are required');
}

const lang = ['nl', 'fr', 'en'].includes(request.language) ? request.language : 'nl';
const copy = {
  nl: { subject: 'Uw indicatieve berekening — RamenSpecialist', title: 'Uw indicatieve berekening', intro: 'Hieronder vindt u een overzicht van uw keuzes en onze indicatieve prijsrange.', selection: 'Uw selectie', price: 'Richtprijs inclusief btw en standaardplaatsing', note: 'De definitieve prijs volgt na technische controle en opmeting.', quantity: 'Aantal' },
  fr: { subject: 'Votre estimation indicative — RamenSpecialist', title: 'Votre estimation indicative', intro: 'Vous trouverez ci-dessous un aperçu de vos choix et de notre fourchette de prix indicative.', selection: 'Votre sélection', price: 'Estimation TVA et pose standard comprises', note: 'Le prix définitif est établi après le contrôle technique et le mesurage.', quantity: 'Quantité' },
  en: { subject: 'Your indicative estimate — RamenSpecialist', title: 'Your indicative estimate', intro: 'Below is a summary of your choices and our indicative price range.', selection: 'Your selection', price: 'Estimate including VAT and standard installation', note: 'The final price follows after a technical check and measurement.', quantity: 'Quantity' },
}[lang];

const productNames = {
  nl: { fixed:'Vast raam', tilt_turn:'Draai-kiepraam', two_sash:'Dubbel draai-kiepraam', three_sash:'Driedelig draai-kiepraam', panoramic_fixed:'Panoramisch vast raam', sliding:'Schuifraam', door:'Buitendeur', garage:'Sectionale garagepoort' },
  fr: { fixed:'Fenêtre fixe', tilt_turn:'Fenêtre oscillo-battante', two_sash:'Fenêtre oscillo-battante à deux ouvrants', three_sash:'Fenêtre oscillo-battante à trois parties', panoramic_fixed:'Fenêtre panoramique fixe', sliding:'Baie coulissante', door:'Porte extérieure', garage:'Porte de garage sectionnelle' },
  en: { fixed:'Fixed window', tilt_turn:'Tilt-and-turn window', two_sash:'Double tilt-and-turn window', three_sash:'Triple tilt-and-turn window', panoramic_fixed:'Panoramic fixed window', sliding:'Sliding window', door:'Exterior door', garage:'Sectional garage door' },
}[lang];

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const locale = lang === 'fr' ? 'fr-BE' : lang === 'en' ? 'en-BE' : 'nl-BE';
const money = value => new Intl.NumberFormat(locale, { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(Number(value));
const rows = (request.products || []).filter(item => Number(item.quantity) > 0).map(item => `
  <tr><td>${escapeHtml(productNames[item.type] || item.type)}</td><td>${escapeHtml(item.quantity)}</td></tr>`).join('');

const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;color:#292e2f;margin:42px;line-height:1.5}h1{font-size:30px;margin:0 0 8px;color:#294b3c}.brand{font-weight:700;letter-spacing:.08em;margin-bottom:36px}.price{font-size:28px;color:#294b3c;font-weight:700;margin:20px 0;padding:18px;background:#ecf2ee;border-radius:10px}table{width:100%;border-collapse:collapse;margin:16px 0 24px}th,td{text-align:left;border-bottom:1px solid #d8d2c9;padding:10px 6px}.muted{color:#686c6a;font-size:13px}</style></head><body>
<div class="brand">RAMEN SPECIALIST</div><h1>${copy.title}</h1><p>${copy.intro}</p><p>${escapeHtml(request.contact.name)}</p>
<h2>${copy.selection}</h2><table><thead><tr><th>${copy.selection}</th><th>${copy.quantity}</th></tr></thead><tbody>${rows}</tbody></table>
<div class="price">${copy.price}<br>${money(calculation.price_low_incl_vat)} – ${money(calculation.price_high_incl_vat)}</div>
<p class="muted">${copy.note}</p></body></html>`;

return [{ json: { email_to: request.contact.email.trim().toLowerCase(), email_subject: copy.subject, pdf_filename: `RamenSpecialist-${request.calculation_id || 'berekening'}.pdf`, html } }];
