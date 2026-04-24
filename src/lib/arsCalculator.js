/**
 * ARS (Asset Recovery Services) valuation calculator for the Carbon Impact Portal.
 *
 * This is a demo-only estimation model. Values are derived from mock depreciation
 * curves, condition grades, and category modifiers. They are illustrative only and
 * do not represent a commercial quote or formal Lenovo ARS valuation.
 *
 * The calculation is intentionally modular: swapping the depreciation curves or
 * adding vendor-specific business rules requires changes only within this file.
 */

// Reference date for "today" in this demo (consistent with FY 2023–2024 dataset)
const REFERENCE_DATE = new Date('2026-04-01')

// ── Factor tables ─────────────────────────────────────────────────────────────

/**
 * Residual value percentage by device age in months.
 * Represents the fraction of original purchase value recoverable through ARS.
 */
export const DEPRECIATION_CURVE = [
  { label: '0–12 months',  maxMonths: 12,       residual: 0.80 },
  { label: '13–24 months', maxMonths: 24,       residual: 0.65 },
  { label: '25–36 months', maxMonths: 36,       residual: 0.50 },
  { label: '37–48 months', maxMonths: 48,       residual: 0.30 },
  { label: '49+ months',   maxMonths: Infinity, residual: 0.15 },
]

export const CONDITION_MULTIPLIERS = {
  excellent: 1.00,
  good:      0.90,
  fair:      0.75,
  poor:      0.50,
}

// Category modifiers reflect refurb market depth and resale demand
export const CATEGORY_MODIFIERS = {
  Laptop:      0.95,
  Workstation: 1.00,
  Desktop:     0.75,
  Monitor:     0.50,
  Tablet:      0.90,
  Accessory:   0.20,
}

// ── Core calculation helpers ─────────────────────────────────────────────────

export function getDeviceAgeMonths(purchaseDate) {
  const purchase = new Date(purchaseDate)
  const diffMs = REFERENCE_DATE.getTime() - purchase.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)))
}

export function getDepreciationFactor(ageMonths) {
  const band = DEPRECIATION_CURVE.find(b => ageMonths <= b.maxMonths)
  return band ? band.residual : 0.04
}

export function getDepreciationBandLabel(ageMonths) {
  const band = DEPRECIATION_CURVE.find(b => ageMonths <= b.maxMonths)
  return band ? band.label : '49+ months'
}

function getConditionMultiplier(grade) {
  return CONDITION_MULTIPLIERS[grade] ?? CONDITION_MULTIPLIERS.fair
}

function getCategoryModifier(category) {
  return CATEGORY_MODIFIERS[category] ?? 0.75
}

/**
 * Returns the estimated ARS value (in GBP) for a single device record.
 * Returns 0 for ineligible devices.
 */
export function calculateDeviceARSValue(device) {
  if (!device.arsEligible) return 0
  const ageMonths = getDeviceAgeMonths(device.purchaseDate)
  const deprFactor = getDepreciationFactor(ageMonths)
  const condFactor = getConditionMultiplier(device.conditionGrade)
  const catMod = getCategoryModifier(device.category)
  return Math.round(device.originalUnitPrice * device.quantity * deprFactor * condFactor * catMod)
}

/**
 * Returns the effective residual percentage for a device (0–100).
 */
export function getEffectiveResidualPct(device) {
  if (!device.arsEligible) return 0
  const ageMonths = getDeviceAgeMonths(device.purchaseDate)
  const deprFactor = getDepreciationFactor(ageMonths)
  const condFactor = getConditionMultiplier(device.conditionGrade)
  const catMod = getCategoryModifier(device.category)
  return Math.round(deprFactor * condFactor * catMod * 100)
}

// ── Portfolio-level summary ───────────────────────────────────────────────────

/**
 * Computes ARS summary statistics across the provided device list.
 * Accepts the full devices array (or a filtered subset).
 */
export function getARSSummary(deviceList) {
  const eligible = deviceList.filter(d => d.arsEligible)
  const ineligible = deviceList.filter(d => !d.arsEligible)

  const totalARSValue = eligible.reduce((s, d) => s + calculateDeviceARSValue(d), 0)
  const eligibleUnitCount = eligible.reduce((s, d) => s + d.quantity, 0)
  const totalUnitCount = deviceList.reduce((s, d) => s + d.quantity, 0)

  // Weighted average residual % across eligible records
  const totalOriginalValue = eligible.reduce((s, d) => s + d.originalUnitPrice * d.quantity, 0)
  const avgResidualPct = totalOriginalValue > 0
    ? Math.round((totalARSValue / totalOriginalValue) * 100)
    : 0

  // By product category
  const categoryMap = {}
  eligible.forEach(d => {
    const val = calculateDeviceARSValue(d)
    categoryMap[d.category] = (categoryMap[d.category] || 0) + val
  })
  const byCategory = Object.entries(categoryMap)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)

  // By reporting country
  const countryMap = {}
  eligible.forEach(d => {
    const val = calculateDeviceARSValue(d)
    countryMap[d.reportingCountry] = (countryMap[d.reportingCountry] || 0) + val
  })
  const byCountry = Object.entries(countryMap)
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  return {
    totalARSValue,        // GBP
    eligibleUnitCount,
    totalUnitCount,
    ineligibleUnitCount: ineligible.reduce((s, d) => s + d.quantity, 0),
    eligibleRecordCount: eligible.length,
    avgResidualPct,
    byCategory,
    byCountry,
  }
}

// ── Currency formatting ───────────────────────────────────────────────────────

export function formatGBP(value, compact = false) {
  if (compact) {
    if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000)     return `£${(value / 1_000).toFixed(1)}K`
    return `£${value.toLocaleString('en-GB')}`
  }
  return `£${value.toLocaleString('en-GB')}`
}
