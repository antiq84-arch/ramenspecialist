// TEST ONLY. Remove this file before production deployment.
// These public demo anchors are for UX testing and are not supplier prices.
window.RS_TEST_PRICING = request => {
  const anchors = { fixed:750, tilt_turn:1050, two_sash:1650, three_sash:2300, panoramic_fixed:1900, sliding:5500, door:2500, garage:3200 };
  let base = (request.products || []).reduce((sum, item) => sum + (anchors[item.type] || 0) * Number(item.quantity || 0), 0);
  if (request.options?.profile === 'optimal') base *= 1.12;
  if (request.options?.glazing === 'triple') base *= 1.1;
  if (request.options?.colour === 'outside') base *= 1.08;
  if (request.options?.colour === 'both') base *= 1.14;
  if (request.options?.shutter !== 'none') base += (request.options.shutter === 'built_in' ? 750 : 650) * Number(request.options.shutter_quantity || 0);
  base += 180 * Number(request.options?.mosquito_screen_quantity || 0);
  base += 250 * Number(request.options?.ventilation_quantity || 0);
  base += 350;
  const vat = request.project?.vat_choice === 'renovation_6' ? 1.06 : 1.21;
  const round50 = value => Math.round(value / 50) * 50;
  return { low:round50(base * 1.4 * vat), high:round50(base * 1.55 * vat) };
};
