/**
 * Framework-aligned CSV export mappers for the Carbon Impact Portal.
 *
 * Each mapper transforms a device record into a framework-specific row object.
 * The CSV builder and download trigger are generic utilities.
 * Swapping mock data for a real API response requires no changes here.
 */

import { devices } from '../data/mockData'

// ── Utilities ────────────────────────────────────────────────────────────────

function toReportingPeriod(purchaseDate) {
  return `FY ${purchaseDate.substring(0, 4)}`
}

function escape(v) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

function buildCSV(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  return [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\r\n')
}

export function downloadCSV(filename, rows) {
  const csv = buildCSV(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Row mappers (one per framework) ─────────────────────────────────────────

function mapRaw(d) {
  return {
    'ID': d.id,
    'Manufacturer': d.manufacturer,
    'Product Family': d.productFamily,
    'Product Name': d.model,
    'Category': d.category,
    'Condition': d.condition,
    'Quantity': d.quantity,
    'Purchase Date': d.purchaseDate,
    'Shipping Country': d.shippingCountry,
    'Reporting Country': d.reportingCountry,
    'Geo Override Flag': d.reportingCountryOverride ? 'Yes' : 'No',
    'Total Emissions (kg CO2e)': d.emissionsTotal,
    'Manufacturing Emissions (kg CO2e)': d.emissionsManufacturing,
    'Transport Emissions (kg CO2e)': d.emissionsTransport,
    'Use Phase Emissions (kg CO2e)': d.emissionsUsePhase,
    'End of Life Emissions (kg CO2e)': d.emissionsEndOfLife,
    'Scope 1 Emissions (kg CO2e)': d.emissionsScope1,
    'Scope 2 Emissions (kg CO2e)': d.emissionsScope2,
    'Scope 3 Emissions (kg CO2e)': d.emissionsScope3,
  }
}

function mapGRI(d) {
  return {
    'Reporting Period': toReportingPeriod(d.purchaseDate),
    'Reporting Country': d.reportingCountry,
    'Manufacturer': d.manufacturer,
    'Product Family': d.productFamily,
    'Product Name': d.model,
    'Category': d.category,
    'Device Condition': d.condition,
    'Quantity': d.quantity,
    'Total Emissions (kg CO2e)': d.emissionsTotal,
    'Scope 1 Emissions (kg CO2e)': d.emissionsScope1,
    'Scope 2 Emissions (kg CO2e)': d.emissionsScope2,
    'Scope 3 Emissions (kg CO2e)': d.emissionsScope3,
    'Methodology Note': 'Product carbon footprint × quantity. Refurbished devices apply -40% manufacturing factor. Per ISO 14040/44.',
  }
}

function mapESRS(d) {
  return {
    'Reporting Period': toReportingPeriod(d.purchaseDate),
    'Reporting Country': d.reportingCountry,
    'Shipping Country': d.shippingCountry,
    'Geo Override Flag': d.reportingCountryOverride ? 'Yes' : 'No',
    'Manufacturer': d.manufacturer,
    'Product Family': d.productFamily,
    'Product Name': d.model,
    'Category': d.category,
    'Quantity': d.quantity,
    'Total Emissions (kg CO2e)': d.emissionsTotal,
    'Scope 1 Emissions (kg CO2e)': d.emissionsScope1,
    'Scope 2 Emissions (kg CO2e)': d.emissionsScope2,
    'Scope 3 Emissions (kg CO2e)': d.emissionsScope3,
    'Lifecycle Stage Data Available': 'Yes',
    'Methodology Version': '1.0',
    'Data Source': 'Lenovo Carbon Impact Portal — Mock Dataset',
    'Notes': 'Demo data. Not for submission. Refer to Methodology page for full calculation basis.',
  }
}

function mapCDP(d) {
  return {
    'Reporting Period': toReportingPeriod(d.purchaseDate),
    'Reporting Country': d.reportingCountry,
    'Manufacturer': d.manufacturer,
    'Category': d.category,
    'Quantity': d.quantity,
    'Total Emissions (kg CO2e)': d.emissionsTotal,
    'Scope 1 Emissions (kg CO2e)': d.emissionsScope1,
    'Scope 2 Emissions (kg CO2e)': d.emissionsScope2,
    'Scope 3 Emissions (kg CO2e)': d.emissionsScope3,
    'Emissions Calculation Basis': 'Product Carbon Footprint (PCF) × Quantity',
    'Data Source': 'Lenovo Carbon Impact Portal',
    'Comments': 'Demo data only. Scope 3 values reflect Purchased Goods & Services (Category 1) from customer perspective.',
  }
}

function mapIFRS(d) {
  return {
    'Reporting Period': toReportingPeriod(d.purchaseDate),
    'Reporting Country': d.reportingCountry,
    'Manufacturer': d.manufacturer,
    'Product Family': d.productFamily,
    'Category': d.category,
    'Quantity': d.quantity,
    'Total Emissions (kg CO2e)': d.emissionsTotal,
    'Scope 1 Emissions (kg CO2e)': d.emissionsScope1,
    'Scope 2 Emissions (kg CO2e)': d.emissionsScope2,
    'Scope 3 Emissions (kg CO2e)': d.emissionsScope3,
    'Methodology Version': '1.0',
    'Assumptions': 'PCF per ISO 14040/44. Use phase uses market-average grid emission factors. Refurbished devices: -40% manufacturing emissions.',
    'Data Source': 'Lenovo Carbon Impact Portal — Mock Dataset',
  }
}

// ── Export definitions (consumed by the UI) ──────────────────────────────────

export const EXPORT_CONFIGS = [
  {
    id: 'raw',
    label: 'Raw Data CSV',
    subtitle: 'Complete device-level dataset with all available fields',
    filename: 'carbon-impact-raw-data.csv',
    accentColor: '#6b7280',
    accentBg: 'bg-gray-50',
    accentBorder: 'border-gray-200',
    accentText: 'text-gray-700',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    frameworkTag: null,
    description:
      'Full export of all device purchase records with lifecycle stage breakdowns, GHG scope allocations, and geographic metadata. Designed for use in BI tools or as a data foundation for custom reporting.',
    columns: [
      'ID', 'Manufacturer', 'Product Family', 'Product Name', 'Category',
      'Condition', 'Quantity', 'Purchase Date', 'Shipping Country', 'Reporting Country',
      'Geo Override Flag', 'Total Emissions', 'Manufacturing', 'Transport',
      'Use Phase', 'End of Life', 'Scope 1', 'Scope 2', 'Scope 3',
    ],
    mapper: mapRaw,
  },
  {
    id: 'gri',
    label: 'GRI Export',
    subtitle: 'Supports GRI 305 — Emissions disclosure',
    filename: 'carbon-impact-gri-export.csv',
    accentColor: '#059669',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    frameworkTag: 'GRI 305',
    description:
      'Structured to support GRI 305 emissions disclosures. Includes GHG scope totals, product and category context, and a methodology note. Useful as a data input for sustainability report annexes.',
    columns: [
      'Reporting Period', 'Reporting Country', 'Manufacturer', 'Product Family',
      'Product Name', 'Category', 'Device Condition', 'Quantity',
      'Total Emissions', 'Scope 1', 'Scope 2', 'Scope 3', 'Methodology Note',
    ],
    mapper: mapGRI,
  },
  {
    id: 'esrs',
    label: 'ESRS / CSRD Export',
    subtitle: 'Supports ESRS E1 — Climate change disclosure (EU)',
    filename: 'carbon-impact-esrs-csrd-export.csv',
    accentColor: '#1e40af',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentText: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    frameworkTag: 'ESRS E1',
    description:
      'Oriented toward CSRD / ESRS E1 reporting obligations for EU entities. Includes full geographic fields, geo-override flag, lifecycle data availability indicator, and methodology version to support double materiality and value-chain disclosures.',
    columns: [
      'Reporting Period', 'Reporting Country', 'Shipping Country', 'Geo Override Flag',
      'Manufacturer', 'Product Family', 'Product Name', 'Category', 'Quantity',
      'Total Emissions', 'Scope 1', 'Scope 2', 'Scope 3',
      'Lifecycle Stage Data Available', 'Methodology Version', 'Data Source', 'Notes',
    ],
    mapper: mapESRS,
  },
  {
    id: 'cdp',
    label: 'CDP Export',
    subtitle: 'Supports CDP Climate questionnaire — Scope 3 inputs',
    filename: 'carbon-impact-cdp-export.csv',
    accentColor: '#7c3aed',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    accentText: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    frameworkTag: 'CDP Climate',
    description:
      'Framed as a climate disclosure support extract for CDP questionnaire responses. Emphasises Scope 3 Category 1 (Purchased Goods & Services) emissions, calculation basis, and data provenance.',
    columns: [
      'Reporting Period', 'Reporting Country', 'Manufacturer', 'Category',
      'Quantity', 'Total Emissions', 'Scope 1', 'Scope 2', 'Scope 3',
      'Emissions Calculation Basis', 'Data Source', 'Comments',
    ],
    mapper: mapCDP,
  },
  {
    id: 'ifrs',
    label: 'IFRS S2 Export',
    subtitle: 'Supports IFRS S2 — Climate-related financial disclosures',
    filename: 'carbon-impact-ifrs-s2-export.csv',
    accentColor: '#b45309',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentText: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    frameworkTag: 'IFRS S2',
    description:
      'Investor-oriented climate disclosure support extract aligned with IFRS S2. Includes methodology version, key assumptions, and data provenance fields required for credible climate-related financial disclosures.',
    columns: [
      'Reporting Period', 'Reporting Country', 'Manufacturer', 'Product Family',
      'Category', 'Quantity', 'Total Emissions', 'Scope 1', 'Scope 2', 'Scope 3',
      'Methodology Version', 'Assumptions', 'Data Source',
    ],
    mapper: mapIFRS,
  },
]

// ── Entry point called by UI ──────────────────────────────────────────────────

export function runExport(config) {
  const rows = devices.map(config.mapper)
  downloadCSV(config.filename, rows)
}

export const EXPORT_META = {
  recordCount: devices.length,
  reportingPeriod: 'FY 2023 – FY 2024',
  deviceCount: devices.reduce((s, d) => s + d.quantity, 0),
}
