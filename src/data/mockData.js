// Mock data for Carbon Impact Portal
// Data model is manufacturer-agnostic to support future multi-vendor expansion.
// Emissions are in kg CO2e.

export const MANUFACTURERS = {
  LENOVO: 'Lenovo',
  // Future: 'Dell', 'HP', 'Apple', etc.
}

export const LIFECYCLE_STAGES = {
  MANUFACTURING: 'Manufacturing',
  TRANSPORT: 'Transport',
  USE_PHASE: 'Use Phase',
  END_OF_LIFE: 'End of Life',
}

export const GHG_SCOPES = {
  SCOPE_1: 'Scope 1',
  SCOPE_2: 'Scope 2',
  SCOPE_3: 'Scope 3',
}

export const PRODUCT_CATEGORIES = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  WORKSTATION: 'Workstation',
  MONITOR: 'Monitor',
  TABLET: 'Tablet',
  ACCESSORY: 'Accessory',
}

// Per-unit carbon footprint data (kg CO2e) by product model
// Source: representative PCF values inspired by publicly available LCA data
const PRODUCT_FOOTPRINTS = {
  'ThinkPad X1 Carbon Gen 11':     { category: PRODUCT_CATEGORIES.LAPTOP,      mfg: 285, transport: 18, use: 98,  eol: 12, s1: 5,  s2: 22, s3: 386 },
  'ThinkPad T14s Gen 4':           { category: PRODUCT_CATEGORIES.LAPTOP,      mfg: 268, transport: 16, use: 95,  eol: 11, s1: 4,  s2: 20, s3: 366 },
  'ThinkPad E15 Gen 4':            { category: PRODUCT_CATEGORIES.LAPTOP,      mfg: 312, transport: 20, use: 110, eol: 14, s1: 6,  s2: 26, s3: 430 },
  'ThinkPad L14 Gen 3':            { category: PRODUCT_CATEGORIES.LAPTOP,      mfg: 290, transport: 18, use: 102, eol: 12, s1: 5,  s2: 23, s3: 400 },
  'IdeaPad 5 Pro 14':              { category: PRODUCT_CATEGORIES.LAPTOP,      mfg: 246, transport: 15, use: 88,  eol: 10, s1: 4,  s2: 19, s3: 342 },
  'ThinkCentre M90q':              { category: PRODUCT_CATEGORIES.DESKTOP,     mfg: 198, transport: 22, use: 180, eol: 18, s1: 7,  s2: 40, s3: 371 },
  'ThinkCentre M70q':              { category: PRODUCT_CATEGORIES.DESKTOP,     mfg: 176, transport: 20, use: 164, eol: 16, s1: 6,  s2: 36, s3: 328 },
  'ThinkStation P360 Tower':       { category: PRODUCT_CATEGORIES.WORKSTATION, mfg: 520, transport: 38, use: 580, eol: 48, s1: 18, s2: 120, s3: 1048 },
  'ThinkStation P350 Tiny':        { category: PRODUCT_CATEGORIES.WORKSTATION, mfg: 380, transport: 28, use: 320, eol: 32, s1: 12, s2: 72, s3: 676 },
  'ThinkVision T27h-20':           { category: PRODUCT_CATEGORIES.MONITOR,     mfg: 340, transport: 30, use: 210, eol: 28, s1: 8,  s2: 48, s3: 552 },
  'ThinkVision P27h-20':           { category: PRODUCT_CATEGORIES.MONITOR,     mfg: 360, transport: 32, use: 224, eol: 30, s1: 9,  s2: 52, s3: 607 },
  'ThinkVision S27i-30':           { category: PRODUCT_CATEGORIES.MONITOR,     mfg: 280, transport: 24, use: 168, eol: 22, s1: 6,  s2: 38, s3: 468 },
  'ThinkPad X12 Detachable Gen 1': { category: PRODUCT_CATEGORIES.TABLET,      mfg: 220, transport: 14, use: 72,  eol: 9,  s1: 3,  s2: 16, s3: 298 },
  'ThinkPad Keyboard':             { category: PRODUCT_CATEGORIES.ACCESSORY,   mfg: 28,  transport: 4,  use: 8,   eol: 3,  s1: 1,  s2: 3,  s3: 40 },
  'ThinkPad USB-C Hub':            { category: PRODUCT_CATEGORIES.ACCESSORY,   mfg: 22,  transport: 3,  use: 12,  eol: 2,  s1: 1,  s2: 2,  s3: 38 },
}

// Refurbished devices carry a 40% lower manufacturing footprint
const REFURB_FACTOR = 0.60

function buildRecord(id, overrides) {
  const fp = PRODUCT_FOOTPRINTS[overrides.model]
  const qty = overrides.quantity
  const isRefurb = overrides.condition === 'Refurbished'
  const mfgFactor = isRefurb ? REFURB_FACTOR : 1.0

  const mfg = Math.round(fp.mfg * mfgFactor * qty)
  const transport = Math.round(fp.transport * qty)
  const use = Math.round(fp.use * qty)
  const eol = Math.round(fp.eol * qty)
  const total = mfg + transport + use + eol

  // GHG scopes are allocated proportionally from total
  const s3Total = Math.round(fp.s3 * (isRefurb ? mfgFactor : 1) * qty)
  const s2 = Math.round(fp.s2 * qty)
  const s1 = Math.round(fp.s1 * qty)

  return {
    id,
    manufacturer: MANUFACTURERS.LENOVO,
    productFamily: overrides.productFamily,
    model: overrides.model,
    category: fp.category,
    condition: overrides.condition || 'New',
    quantity: qty,
    shippingCountry: overrides.shippingCountry,
    reportingCountry: overrides.reportingCountry || overrides.shippingCountry,
    reportingCountryOverride: overrides.reportingCountry
      ? overrides.reportingCountry !== overrides.shippingCountry
      : false,
    purchaseDate: overrides.purchaseDate,
    // Lifecycle emissions (kg CO2e)
    emissionsManufacturing: mfg,
    emissionsTransport: transport,
    emissionsUsePhase: use,
    emissionsEndOfLife: eol,
    emissionsTotal: total,
    // GHG scope allocations (kg CO2e)
    emissionsScope1: s1,
    emissionsScope2: s2,
    emissionsScope3: s3Total,
  }
}

// ── ARS (Asset Recovery Services) data overlay ───────────────────────────────
// originalUnitPrice is in GBP. conditionGrade reflects physical state as of
// the demo reference date (April 2026). arsEligible excludes low-value
// accessories where recovery economics are not commercially meaningful.
// Condition assignment: New devices purchased 2023 Q1–Q2 → fair (37–42 months
// old); Q3–Q4 2023 and 2024 H1 → good; 2024 H2 → excellent. Refurbished → fair.

const ARS_META = {
  //  id: { originalUnitPrice (GBP), conditionGrade, arsEligible }
  1:  { originalUnitPrice: 1450, conditionGrade: 'fair',      arsEligible: true  },
  2:  { originalUnitPrice:  980, conditionGrade: 'fair',      arsEligible: true  },
  3:  { originalUnitPrice:  720, conditionGrade: 'fair',      arsEligible: true  },
  4:  { originalUnitPrice:  850, conditionGrade: 'fair',      arsEligible: true  },
  5:  { originalUnitPrice: 2400, conditionGrade: 'fair',      arsEligible: true  },
  6:  { originalUnitPrice:  580, conditionGrade: 'fair',      arsEligible: true  },
  7:  { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  8:  { originalUnitPrice:  980, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  9:  { originalUnitPrice:  780, conditionGrade: 'fair',      arsEligible: true  },
  10: { originalUnitPrice:  680, conditionGrade: 'good',      arsEligible: true  },
  11: { originalUnitPrice:  680, conditionGrade: 'fair',      arsEligible: true  },
  12: { originalUnitPrice:  680, conditionGrade: 'good',      arsEligible: true  },
  13: { originalUnitPrice: 1150, conditionGrade: 'good',      arsEligible: true  },
  14: { originalUnitPrice: 1900, conditionGrade: 'fair',      arsEligible: true  },
  15: { originalUnitPrice:  720, conditionGrade: 'good',      arsEligible: true  },
  16: { originalUnitPrice: 1450, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  17: { originalUnitPrice:  380, conditionGrade: 'fair',      arsEligible: true  },
  18: { originalUnitPrice:  980, conditionGrade: 'good',      arsEligible: true  },
  19: { originalUnitPrice:  850, conditionGrade: 'good',      arsEligible: true  },
  20: { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  21: { originalUnitPrice:  980, conditionGrade: 'good',      arsEligible: true  },
  22: { originalUnitPrice:  780, conditionGrade: 'good',      arsEligible: true  },
  23: { originalUnitPrice:  580, conditionGrade: 'good',      arsEligible: true  },
  24: { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  25: { originalUnitPrice: 2400, conditionGrade: 'fair',      arsEligible: true  },
  26: { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  27: { originalUnitPrice:  980, conditionGrade: 'good',      arsEligible: true  },
  28: { originalUnitPrice:  850, conditionGrade: 'good',      arsEligible: true  },
  29: { originalUnitPrice:  580, conditionGrade: 'good',      arsEligible: true  },
  30: { originalUnitPrice:  720, conditionGrade: 'good',      arsEligible: true  },
  31: { originalUnitPrice:  780, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  32: { originalUnitPrice: 2400, conditionGrade: 'good',      arsEligible: true  },
  33: { originalUnitPrice: 1150, conditionGrade: 'good',      arsEligible: true  },
  34: { originalUnitPrice:  680, conditionGrade: 'good',      arsEligible: true  },
  35: { originalUnitPrice:  980, conditionGrade: 'good',      arsEligible: true  },
  36: { originalUnitPrice:  680, conditionGrade: 'good',      arsEligible: true  },
  37: { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  38: { originalUnitPrice:  380, conditionGrade: 'good',      arsEligible: true  },
  39: { originalUnitPrice:  720, conditionGrade: 'good',      arsEligible: true  },
  40: { originalUnitPrice: 1900, conditionGrade: 'good',      arsEligible: true  },
  41: { originalUnitPrice: 1450, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  42: { originalUnitPrice:  980, conditionGrade: 'good',      arsEligible: true  },
  43: { originalUnitPrice:  580, conditionGrade: 'excellent', arsEligible: true  },
  44: { originalUnitPrice:  780, conditionGrade: 'good',      arsEligible: true  },
  45: { originalUnitPrice:  680, conditionGrade: 'excellent', arsEligible: true  },
  46: { originalUnitPrice:   85, conditionGrade: 'good',      arsEligible: false }, // Accessories — not eligible
  47: { originalUnitPrice:   65, conditionGrade: 'good',      arsEligible: false }, // Accessories — not eligible
  48: { originalUnitPrice: 1450, conditionGrade: 'good',      arsEligible: true  },
  49: { originalUnitPrice:  850, conditionGrade: 'good',      arsEligible: true  },
  50: { originalUnitPrice:  720, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  51: { originalUnitPrice: 1450, conditionGrade: 'excellent', arsEligible: true  },
  52: { originalUnitPrice:  980, conditionGrade: 'excellent', arsEligible: true  },
  53: { originalUnitPrice: 2400, conditionGrade: 'excellent', arsEligible: true  },
  54: { originalUnitPrice:  680, conditionGrade: 'excellent', arsEligible: true  },
  55: { originalUnitPrice:  780, conditionGrade: 'excellent', arsEligible: true  },
  56: { originalUnitPrice:  720, conditionGrade: 'fair',      arsEligible: true  }, // Refurbished
  57: { originalUnitPrice:  850, conditionGrade: 'excellent', arsEligible: true  },
  58: { originalUnitPrice: 1150, conditionGrade: 'excellent', arsEligible: true  },
  59: { originalUnitPrice:  380, conditionGrade: 'excellent', arsEligible: true  },
  60: { originalUnitPrice: 1450, conditionGrade: 'excellent', arsEligible: true  },
}

export const devices = [
  buildRecord(1,  { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 120, shippingCountry: 'United States', purchaseDate: '2023-03-15', condition: 'New' }),
  buildRecord(2,  { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 85, shippingCountry: 'Germany', purchaseDate: '2023-04-02', condition: 'New' }),
  buildRecord(3,  { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 60, shippingCountry: 'United Kingdom', purchaseDate: '2023-02-10', condition: 'New' }),
  buildRecord(4,  { productFamily: 'ThinkCentre M', model: 'ThinkCentre M90q', quantity: 40, shippingCountry: 'United States', purchaseDate: '2023-05-20', condition: 'New' }),
  buildRecord(5,  { productFamily: 'ThinkStation P', model: 'ThinkStation P360 Tower', quantity: 18, shippingCountry: 'United States', purchaseDate: '2023-01-08', condition: 'New' }),
  buildRecord(6,  { productFamily: 'ThinkVision', model: 'ThinkVision T27h-20', quantity: 200, shippingCountry: 'France', purchaseDate: '2023-06-01', condition: 'New' }),
  buildRecord(7,  { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 45, shippingCountry: 'Japan', purchaseDate: '2023-07-14', condition: 'New' }),
  buildRecord(8,  { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 30, shippingCountry: 'Australia', purchaseDate: '2023-08-03', condition: 'Refurbished' }),
  buildRecord(9,  { productFamily: 'ThinkPad L', model: 'ThinkPad L14 Gen 3', quantity: 75, shippingCountry: 'Canada', purchaseDate: '2023-03-28', condition: 'New' }),
  buildRecord(10, { productFamily: 'IdeaPad', model: 'IdeaPad 5 Pro 14', quantity: 50, shippingCountry: 'Brazil', purchaseDate: '2023-09-12', condition: 'New' }),
  buildRecord(11, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M70q', quantity: 55, shippingCountry: 'Germany', purchaseDate: '2023-04-18', condition: 'New' }),
  buildRecord(12, { productFamily: 'ThinkVision', model: 'ThinkVision P27h-20', quantity: 80, shippingCountry: 'United States', purchaseDate: '2023-10-05', condition: 'New' }),
  buildRecord(13, { productFamily: 'ThinkPad X12', model: 'ThinkPad X12 Detachable Gen 1', quantity: 25, shippingCountry: 'Singapore', purchaseDate: '2023-07-22', condition: 'New' }),
  buildRecord(14, { productFamily: 'ThinkStation P', model: 'ThinkStation P350 Tiny', quantity: 12, shippingCountry: 'United Kingdom', purchaseDate: '2023-02-28', condition: 'New' }),
  buildRecord(15, { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 35, shippingCountry: 'India', purchaseDate: '2023-11-01', condition: 'New' }),
  buildRecord(16, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 20, shippingCountry: 'Netherlands', purchaseDate: '2023-06-15', condition: 'Refurbished' }),
  buildRecord(17, { productFamily: 'ThinkVision', model: 'ThinkVision S27i-30', quantity: 110, shippingCountry: 'Canada', purchaseDate: '2023-05-10', condition: 'New' }),
  buildRecord(18, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 65, shippingCountry: 'South Korea', purchaseDate: '2023-08-20', condition: 'New' }),
  buildRecord(19, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M90q', quantity: 28, shippingCountry: 'France', purchaseDate: '2023-09-30', condition: 'New' }),
  buildRecord(20, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 90, shippingCountry: 'United States', purchaseDate: '2023-12-01', condition: 'New' }),
  // Reporting country overrides — shipped to one country, reported against another
  buildRecord(21, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 40, shippingCountry: 'Germany', reportingCountry: 'Austria', purchaseDate: '2023-10-15', condition: 'New' }),
  buildRecord(22, { productFamily: 'ThinkPad L', model: 'ThinkPad L14 Gen 3', quantity: 22, shippingCountry: 'Netherlands', reportingCountry: 'Belgium', purchaseDate: '2023-11-10', condition: 'New' }),
  buildRecord(23, { productFamily: 'ThinkVision', model: 'ThinkVision T27h-20', quantity: 55, shippingCountry: 'Singapore', reportingCountry: 'Malaysia', purchaseDate: '2023-07-05', condition: 'New' }),
  buildRecord(24, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 30, shippingCountry: 'United States', reportingCountry: 'Canada', purchaseDate: '2023-08-12', condition: 'New' }),
  buildRecord(25, { productFamily: 'ThinkStation P', model: 'ThinkStation P360 Tower', quantity: 8, shippingCountry: 'United Kingdom', reportingCountry: 'Ireland', purchaseDate: '2023-05-25', condition: 'New' }),
  // More records across 2024
  buildRecord(26, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 150, shippingCountry: 'United States', purchaseDate: '2024-01-10', condition: 'New' }),
  buildRecord(27, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 95, shippingCountry: 'Germany', purchaseDate: '2024-02-14', condition: 'New' }),
  buildRecord(28, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M90q', quantity: 60, shippingCountry: 'United States', purchaseDate: '2024-01-25', condition: 'New' }),
  buildRecord(29, { productFamily: 'ThinkVision', model: 'ThinkVision T27h-20', quantity: 140, shippingCountry: 'France', purchaseDate: '2024-03-05', condition: 'New' }),
  buildRecord(30, { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 70, shippingCountry: 'United Kingdom', purchaseDate: '2024-02-28', condition: 'New' }),
  buildRecord(31, { productFamily: 'ThinkPad L', model: 'ThinkPad L14 Gen 3', quantity: 50, shippingCountry: 'Canada', purchaseDate: '2024-03-18', condition: 'Refurbished' }),
  buildRecord(32, { productFamily: 'ThinkStation P', model: 'ThinkStation P360 Tower', quantity: 22, shippingCountry: 'United States', purchaseDate: '2024-02-05', condition: 'New' }),
  buildRecord(33, { productFamily: 'ThinkPad X12', model: 'ThinkPad X12 Detachable Gen 1', quantity: 35, shippingCountry: 'Japan', purchaseDate: '2024-04-10', condition: 'New' }),
  buildRecord(34, { productFamily: 'ThinkVision', model: 'ThinkVision P27h-20', quantity: 90, shippingCountry: 'Australia', purchaseDate: '2024-03-22', condition: 'New' }),
  buildRecord(35, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 55, shippingCountry: 'South Korea', purchaseDate: '2024-04-28', condition: 'New' }),
  buildRecord(36, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M70q', quantity: 44, shippingCountry: 'Brazil', purchaseDate: '2024-01-15', condition: 'New' }),
  buildRecord(37, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 38, shippingCountry: 'India', purchaseDate: '2024-05-07', condition: 'New' }),
  buildRecord(38, { productFamily: 'ThinkVision', model: 'ThinkVision S27i-30', quantity: 75, shippingCountry: 'Netherlands', purchaseDate: '2024-04-15', condition: 'New' }),
  buildRecord(39, { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 45, shippingCountry: 'Singapore', purchaseDate: '2024-05-20', condition: 'New' }),
  buildRecord(40, { productFamily: 'ThinkStation P', model: 'ThinkStation P350 Tiny', quantity: 16, shippingCountry: 'Germany', purchaseDate: '2024-03-10', condition: 'New' }),
  buildRecord(41, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 25, shippingCountry: 'France', purchaseDate: '2024-06-01', condition: 'Refurbished' }),
  buildRecord(42, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 110, shippingCountry: 'United States', purchaseDate: '2024-06-18', condition: 'New' }),
  buildRecord(43, { productFamily: 'ThinkVision', model: 'ThinkVision T27h-20', quantity: 65, shippingCountry: 'Canada', purchaseDate: '2024-07-02', condition: 'New' }),
  buildRecord(44, { productFamily: 'ThinkPad L', model: 'ThinkPad L14 Gen 3', quantity: 80, shippingCountry: 'United Kingdom', purchaseDate: '2024-06-25', condition: 'New' }),
  buildRecord(45, { productFamily: 'IdeaPad', model: 'IdeaPad 5 Pro 14', quantity: 60, shippingCountry: 'Australia', purchaseDate: '2024-07-15', condition: 'New' }),
  buildRecord(46, { productFamily: 'ThinkPad Accessories', model: 'ThinkPad Keyboard', quantity: 300, shippingCountry: 'United States', purchaseDate: '2024-04-01', condition: 'New' }),
  buildRecord(47, { productFamily: 'ThinkPad Accessories', model: 'ThinkPad USB-C Hub', quantity: 200, shippingCountry: 'United States', purchaseDate: '2024-04-01', condition: 'New' }),
  buildRecord(48, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 60, shippingCountry: 'South Korea', reportingCountry: 'Japan', purchaseDate: '2024-05-30', condition: 'New' }),
  buildRecord(49, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M90q', quantity: 35, shippingCountry: 'Netherlands', reportingCountry: 'Germany', purchaseDate: '2024-06-10', condition: 'New' }),
  buildRecord(50, { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 28, shippingCountry: 'Canada', reportingCountry: 'United States', purchaseDate: '2024-07-20', condition: 'Refurbished' }),
  // 2024 H2
  buildRecord(51, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 180, shippingCountry: 'United States', purchaseDate: '2024-08-05', condition: 'New' }),
  buildRecord(52, { productFamily: 'ThinkPad T', model: 'ThinkPad T14s Gen 4', quantity: 120, shippingCountry: 'Germany', purchaseDate: '2024-09-12', condition: 'New' }),
  buildRecord(53, { productFamily: 'ThinkStation P', model: 'ThinkStation P360 Tower', quantity: 30, shippingCountry: 'United States', purchaseDate: '2024-08-22', condition: 'New' }),
  buildRecord(54, { productFamily: 'ThinkVision', model: 'ThinkVision P27h-20', quantity: 100, shippingCountry: 'France', purchaseDate: '2024-09-30', condition: 'New' }),
  buildRecord(55, { productFamily: 'ThinkPad L', model: 'ThinkPad L14 Gen 3', quantity: 90, shippingCountry: 'Brazil', purchaseDate: '2024-10-08', condition: 'New' }),
  buildRecord(56, { productFamily: 'ThinkPad E', model: 'ThinkPad E15 Gen 4', quantity: 55, shippingCountry: 'India', purchaseDate: '2024-11-14', condition: 'Refurbished' }),
  buildRecord(57, { productFamily: 'ThinkCentre M', model: 'ThinkCentre M90q', quantity: 48, shippingCountry: 'United Kingdom', purchaseDate: '2024-10-20', condition: 'New' }),
  buildRecord(58, { productFamily: 'ThinkPad X12', model: 'ThinkPad X12 Detachable Gen 1', quantity: 40, shippingCountry: 'Singapore', purchaseDate: '2024-11-01', condition: 'New' }),
  buildRecord(59, { productFamily: 'ThinkVision', model: 'ThinkVision S27i-30', quantity: 85, shippingCountry: 'Australia', purchaseDate: '2024-12-05', condition: 'New' }),
  buildRecord(60, { productFamily: 'ThinkPad X1', model: 'ThinkPad X1 Carbon Gen 11', quantity: 70, shippingCountry: 'Japan', purchaseDate: '2024-12-15', condition: 'New' }),
// Merge ARS fields into each record
].map(d => ({ ...d, ...(ARS_META[d.id] ?? { originalUnitPrice: 0, conditionGrade: 'good', arsEligible: false }) }))

// ── Derived aggregations ─────────────────────────────────────────────────────

export function getTotalEmissions() {
  return devices.reduce((s, d) => s + d.emissionsTotal, 0)
}

export function getTotalDevices() {
  return devices.reduce((s, d) => s + d.quantity, 0)
}

export function getRefurbishedCount() {
  return devices.filter(d => d.condition === 'Refurbished').reduce((s, d) => s + d.quantity, 0)
}

export function getCountries() {
  return [...new Set(devices.map(d => d.reportingCountry))].sort()
}

export function getEmissionsByReportingCountry() {
  const map = {}
  devices.forEach(d => {
    map[d.reportingCountry] = (map[d.reportingCountry] || 0) + d.emissionsTotal
  })
  return Object.entries(map)
    .map(([country, emissions]) => ({ country, emissions }))
    .sort((a, b) => b.emissions - a.emissions)
}

export function getEmissionsByCategory() {
  const map = {}
  devices.forEach(d => {
    map[d.category] = (map[d.category] || 0) + d.emissionsTotal
  })
  return Object.entries(map)
    .map(([category, emissions]) => ({ category, emissions }))
    .sort((a, b) => b.emissions - a.emissions)
}

export function getEmissionsByLifecycleStage() {
  const mfg = devices.reduce((s, d) => s + d.emissionsManufacturing, 0)
  const transport = devices.reduce((s, d) => s + d.emissionsTransport, 0)
  const use = devices.reduce((s, d) => s + d.emissionsUsePhase, 0)
  const eol = devices.reduce((s, d) => s + d.emissionsEndOfLife, 0)
  return [
    { stage: 'Manufacturing', emissions: mfg },
    { stage: 'Use Phase', emissions: use },
    { stage: 'Transport', emissions: transport },
    { stage: 'End of Life', emissions: eol },
  ]
}

export function getEmissionsByGHGScope() {
  const s1 = devices.reduce((s, d) => s + d.emissionsScope1, 0)
  const s2 = devices.reduce((s, d) => s + d.emissionsScope2, 0)
  const s3 = devices.reduce((s, d) => s + d.emissionsScope3, 0)
  return [
    { scope: 'Scope 3', emissions: s3 },
    { scope: 'Scope 2', emissions: s2 },
    { scope: 'Scope 1', emissions: s1 },
  ]
}

export function getEmissionsByMonth() {
  const map = {}
  devices.forEach(d => {
    const month = d.purchaseDate.substring(0, 7) // 'YYYY-MM'
    map[month] = (map[month] || 0) + d.emissionsTotal
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, emissions]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      emissions,
    }))
}

export function getEmissionsByQuarter() {
  const map = {}
  devices.forEach(d => {
    const year = d.purchaseDate.substring(0, 4)
    const monthNum = parseInt(d.purchaseDate.substring(5, 7))
    const quarter = Math.ceil(monthNum / 3)
    const key = `${year} Q${quarter}`
    map[key] = (map[key] || 0) + d.emissionsTotal
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, emissions]) => ({ period, emissions }))
}

export function getCountryComparisonData() {
  const shippingMap = {}
  const reportingMap = {}
  devices.forEach(d => {
    shippingMap[d.shippingCountry] = (shippingMap[d.shippingCountry] || 0) + d.emissionsTotal
    reportingMap[d.reportingCountry] = (reportingMap[d.reportingCountry] || 0) + d.emissionsTotal
  })
  const allCountries = new Set([...Object.keys(shippingMap), ...Object.keys(reportingMap)])
  return [...allCountries]
    .map(country => ({
      country,
      shippingEmissions: shippingMap[country] || 0,
      reportingEmissions: reportingMap[country] || 0,
      hasOverride: shippingMap[country] !== reportingMap[country],
    }))
    .sort((a, b) => b.reportingEmissions - a.reportingEmissions)
}
