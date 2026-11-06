// TEST ONLY. Remove this file before production deployment.
// These public demo anchors are for UX testing and are not supplier prices.
window.RS_TEST_PRICING = request => {
  const products = {
    fixed:            { cost:350,  area:1.50 },
    tilt_turn:        { cost:500,  area:1.50 },
    two_sash:         { cost:850,  area:2.47 },
    three_sash:       { cost:1200, area:2.99 },
    panoramic_fixed: { cost:900,  area:3.01 },
    sliding:          { cost:2500, area:6.72 },
    door:             { cost:1200, area:2.15 },
    garage:           { cost:1600, area:5.31 },
  };

  let factoryCost = 0;
  let totalArea = 0;
  let shutterEligibleArea = 0;
  let shutterEligibleUnits = 0;
  for (const item of request.products || []) {
    const product = products[item.type];
    const quantity = Number(item.quantity || 0);
    if (!product || quantity < 1) continue;
    factoryCost += product.cost * quantity;
    totalArea += product.area * quantity;
    if (['fixed', 'tilt_turn', 'two_sash', 'three_sash', 'panoramic_fixed'].includes(item.type)) {
      shutterEligibleArea += product.area * quantity;
      shutterEligibleUnits += quantity;
    }
  }

  if (request.options?.profile === 'optimal') factoryCost *= 1.12;
  if (request.options?.glazing === 'triple') factoryCost *= 1.10;
  if (request.options?.colour === 'outside') factoryCost *= 1.08;
  if (request.options?.colour === 'both') factoryCost *= 1.14;
  const shutterQuantity = Math.min(Number(request.options?.shutter_quantity || 0), shutterEligibleUnits);
  if (request.options?.shutter !== 'none' && shutterQuantity > 0) {
    factoryCost += (request.options.shutter === 'built_in' ? 450 : 350) * shutterQuantity;
  }
  factoryCost += 100 * Number(request.options?.mosquito_screen_quantity || 0);
  factoryCost += 150 * Number(request.options?.ventilation_quantity || 0);

  const optimal = request.options?.profile === 'optimal';
  const markupLow = optimal ? 1.60 : 1.50;
  const markupHigh = optimal ? 1.65 : 1.55;
  const placementArea = totalArea + (request.options?.shutter === 'built_in' ? shutterQuantity : 0);
  const placement = placementArea >= 2.5 ? placementArea * 130 : 350;
  const averageShutterArea = shutterEligibleUnits ? shutterEligibleArea / shutterEligibleUnits : 0;
  const wallShutterPlacement = request.options?.shutter === 'surface'
    ? averageShutterArea * shutterQuantity * 60
    : 0;
  const logisticsAndWarehouse = 350;
  const lowExclVat = factoryCost * markupLow + placement + wallShutterPlacement + logisticsAndWarehouse;
  const highExclVat = factoryCost * markupHigh + placement + wallShutterPlacement + logisticsAndWarehouse;
  const vat = request.project?.vat_choice === 'renovation_6' ? 1.06 : 1.21;
  const round50 = value => Math.round(value / 50) * 50;
  return { low:round50(lowExclVat * vat), high:round50(highExclVat * vat) };
};
