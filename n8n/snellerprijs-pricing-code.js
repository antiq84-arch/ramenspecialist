// n8n Code node — Snelle Prijs private pricing engine
// Input must contain: { request: <webhook body>, _privatePricing: <private config> }
// Never return or log _privatePricing.

const input = $input.first().json;
const request = input.request || input.body || input;
const config = input._privatePricing;

if (!config || !config.constructions) {
  throw new Error('Private pricing configuration is missing');
}

const reference = {
  fixed: { width: 1.0, height: 1.5 },
  tilt_turn: { width: 1.0, height: 1.5 },
  two_sash: { width: 1.7, height: 1.45 },
  three_sash: { width: 2.3, height: 1.3 },
  panoramic_fixed: { width: 1.4, height: 2.15 },
  sliding: { width: 3.2, height: 2.1 },
  door: { width: 1.0, height: 2.15 },
  garage: { width: 2.5, height: 2.125 },
};

const allowedLanguages = new Set(['nl', 'fr', 'en']);
const allowedVat = new Set(['renovation_6', 'standard_21']);
const products = Array.isArray(request.products) ? request.products : [];

if (!allowedLanguages.has(request.language)) request.language = 'nl';
if (!allowedVat.has(request.project?.vat_choice)) throw new Error('Invalid VAT choice');
if (!products.length) throw new Error('At least one product is required');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round50 = value => Math.round(value / 50) * 50;
const money = value => Math.round(value * 100) / 100;
const positiveInteger = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
};

let productCost = 0;
let totalArea = 0;
let openingUnits = 0;
let manualReview = Boolean(request.manual_review);

for (const product of products) {
  const ref = reference[product.type];
  const anchor = config.constructions[product.type];
  const quantity = positiveInteger(product.quantity);
  if (!ref || !anchor || quantity < 1) throw new Error(`Invalid product: ${product.type}`);

  const width = Number(product.width_m || ref.width);
  const height = Number(product.height_m || ref.height);
  const area = width * height;
  const referenceArea = ref.width * ref.height;
  const sizeFactor = clamp(Math.pow(area / referenceArea, 0.72), 0.72, 1.55);
  let unitCost = Number(anchor.base) * sizeFactor;

  if (request.options?.profile === 'optimal') unitCost *= Number(config.profile_optimal_factor || 1);
  if (request.options?.glazing === 'triple') unitCost += Number(config.triple_glazing_per_m2 || 0) * area;
  if (request.options?.colour === 'outside') unitCost *= Number(config.colour_outside_factor || 1);
  if (request.options?.colour === 'both') unitCost *= Number(config.colour_both_factor || 1);

  productCost += unitCost * quantity;
  totalArea += area * quantity;
  if (['tilt_turn', 'two_sash', 'three_sash', 'sliding'].includes(product.type)) openingUnits += quantity;
  if (['panoramic_fixed', 'sliding', 'door', 'garage'].includes(product.type)) manualReview = true;
}

const shutterQuantity = positiveInteger(request.options?.shutter_quantity);
if (request.options?.shutter && request.options.shutter !== 'none' && shutterQuantity) {
  const key = request.options.shutter === 'built_in' ? 'built_in' : 'surface';
  productCost += Number(config.shutters?.[key] || 0) * shutterQuantity;
}

const screenQuantity = Math.min(positiveInteger(request.options?.mosquito_screen_quantity), openingUnits);
if (request.options?.mosquito_screen && screenQuantity) {
  productCost += Number(config.mosquito_screen_each || 0) * screenQuantity;
}

if (request.options?.ventilation) {
  productCost += Number(config.ventilation_each || 0) * Math.max(1, openingUnits);
}

// Mark-up ranges are configured privately per proposition.
// Example: factory cost 100 with 50% mark-up becomes 150.
const profile = request.options?.profile === 'optimal' ? 'optimal' : 'budget';
const markupLow = Number(profile === 'optimal' ? config.markup_optimal_low : config.markup_budget_low);
const markupHigh = Number(profile === 'optimal' ? config.markup_optimal_high : config.markup_budget_high);
if (![markupLow, markupHigh].every(value => Number.isFinite(value) && value >= 0) || markupHigh < markupLow) {
  throw new Error(`Commercial mark-up range is missing for profile: ${profile}`);
}
const commercialProductsLow = productCost * (1 + markupLow);
const commercialProductsHigh = productCost * (1 + markupHigh);
const logisticsAndWarehouse = Number(config.logistics_and_warehouse_flat || 350);
const placement = Math.max(totalArea * 130, 350);
const projectSurcharge = request.project?.building_type === 'apartment' && Number(request.project.floor) >= 2 && !request.project.lift
  ? Number(config.upper_floor_review_allowance || 0)
  : 0;

if (projectSurcharge > 0 || request.project?.building_type === 'apartment' && Number(request.project.floor) >= 2 && !request.project.lift) {
  manualReview = true;
}

const subtotalLowExclVat = commercialProductsLow + logisticsAndWarehouse + placement + projectSurcharge;
const subtotalHighExclVat = commercialProductsHigh + logisticsAndWarehouse + placement + projectSurcharge;
const vatRate = request.project.vat_choice === 'renovation_6' ? 0.06 : 0.21;
const low = round50(subtotalLowExclVat * (1 + vatRate));
const high = round50(subtotalHighExclVat * (1 + vatRate));

const assumptions = {
  nl: ['Standaard referentiematen gebruikt', 'Plaatsing en afvoer inbegrepen', vatRate === 0.06 ? '6% btw onder voorbehoud van wettelijke voorwaarden' : '21% btw inbegrepen'],
  fr: ['Dimensions de référence standard utilisées', 'Pose et évacuation comprises', vatRate === 0.06 ? 'TVA de 6 % sous réserve des conditions légales' : 'TVA de 21 % comprise'],
  en: ['Standard reference dimensions used', 'Installation and removal included', vatRate === 0.06 ? '6% VAT subject to legal conditions' : '21% VAT included'],
};

return [{
  json: {
    ok: true,
    currency: 'EUR',
    vat_rate: vatRate,
    price_low_incl_vat: low,
    price_high_incl_vat: high,
    placement_included: true,
    manual_review: manualReview,
    assumptions: assumptions[request.language],
    calculation_version: 'sp-v8-2026-11-markup-v3',
    // Internal audit totals stay inside n8n. Remove this object in the Respond to Webhook node.
    _internal: {
      total_area_m2: money(totalArea),
      placement_excl_vat: money(placement),
      logistics_and_warehouse_excl_vat: money(logisticsAndWarehouse),
      estimate_low_excl_vat: money(subtotalLowExclVat),
      estimate_high_excl_vat: money(subtotalHighExclVat),
    },
  },
}];
