import { useState, useMemo } from 'react'
import { Search, Download, ChevronUp, ChevronDown, ChevronsUpDown, ArrowUpDown } from 'lucide-react'
import { devices } from '../data/mockData'
import { Card, Badge, formatNumber, formatEmissions } from '../components/ui'

const PAGE_SIZE = 15

function exportCSV(rows) {
  const headers = [
    'ID', 'Manufacturer', 'Product Family', 'Model', 'Category', 'Condition',
    'Quantity', 'Shipping Country', 'Reporting Country', 'Reporting Country Override',
    'Purchase Date', 'Total Emissions (kg CO2e)',
    'Manufacturing (kg CO2e)', 'Transport (kg CO2e)', 'Use Phase (kg CO2e)', 'End of Life (kg CO2e)',
    'Scope 1 (kg CO2e)', 'Scope 2 (kg CO2e)', 'Scope 3 (kg CO2e)',
  ]
  const csvRows = rows.map(d => [
    d.id, d.manufacturer, d.productFamily, d.model, d.category, d.condition,
    d.quantity, d.shippingCountry, d.reportingCountry, d.reportingCountryOverride ? 'Yes' : 'No',
    d.purchaseDate, d.emissionsTotal,
    d.emissionsManufacturing, d.emissionsTransport, d.emissionsUsePhase, d.emissionsEndOfLife,
    d.emissionsScope1, d.emissionsScope2, d.emissionsScope3,
  ])
  const csv = [headers, ...csvRows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'carbon-impact-devices.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const SORT_FIELDS = {
  purchaseDate: (a, b) => a.purchaseDate.localeCompare(b.purchaseDate),
  model: (a, b) => a.model.localeCompare(b.model),
  shippingCountry: (a, b) => a.shippingCountry.localeCompare(b.shippingCountry),
  reportingCountry: (a, b) => a.reportingCountry.localeCompare(b.reportingCountry),
  quantity: (a, b) => a.quantity - b.quantity,
  emissionsTotal: (a, b) => a.emissionsTotal - b.emissionsTotal,
}

export default function Devices() {
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterCondition, setFilterCondition] = useState('All')
  const [sortField, setSortField] = useState('emissionsTotal')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const countries = useMemo(() => ['All', ...new Set(devices.map(d => d.reportingCountry))].sort(), [])
  const categories = useMemo(() => ['All', ...new Set(devices.map(d => d.category))].sort(), [])

  const filtered = useMemo(() => {
    let rows = devices
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(d =>
        d.model.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.shippingCountry.toLowerCase().includes(q) ||
        d.reportingCountry.toLowerCase().includes(q) ||
        d.productFamily.toLowerCase().includes(q)
      )
    }
    if (filterCountry !== 'All') rows = rows.filter(d => d.reportingCountry === filterCountry)
    if (filterCategory !== 'All') rows = rows.filter(d => d.category === filterCategory)
    if (filterCondition !== 'All') rows = rows.filter(d => d.condition === filterCondition)
    if (SORT_FIELDS[sortField]) {
      rows = [...rows].sort((a, b) => {
        const cmp = SORT_FIELDS[sortField](a, b)
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return rows
  }, [search, filterCountry, filterCategory, filterCondition, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = field => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }

  const handleFilterChange = setter => v => { setter(v); setPage(1) }

  const totalFiltered = filtered.reduce((s, d) => s + d.emissionsTotal, 0)
  const totalFilteredDevices = filtered.reduce((s, d) => s + d.quantity, 0)

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex gap-6">
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium block">Showing Records</span>
            <span className="text-[15px] font-bold text-gray-900">{filtered.length} <span className="text-[13px] text-gray-400 font-normal">of {devices.length}</span></span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium block">Filtered Devices</span>
            <span className="text-[15px] font-bold text-gray-900">{formatNumber(totalFilteredDevices)}</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium block">Filtered Emissions</span>
            <span className="text-[15px] font-bold text-[#e2231a]">
              {(() => { const f = formatEmissions(totalFiltered); return `${f.value} ${f.unit}` })()}
            </span>
          </div>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2 bg-[#e2231a] text-white rounded-lg text-[13px] font-semibold hover:bg-red-700 transition-colors shadow-sm"
        >
          <Download size={14} />
          Export CSV ({filtered.length} rows)
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search models, countries…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
          />
        </div>
        <Select label="Country" value={filterCountry} options={countries} onChange={handleFilterChange(setFilterCountry)} />
        <Select label="Category" value={filterCategory} options={categories} onChange={handleFilterChange(setFilterCategory)} />
        <Select label="Condition" value={filterCondition} options={['All', 'New', 'Refurbished']} onChange={handleFilterChange(setFilterCondition)} />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <Th label="Model / Family" field="model" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Condition</th>
                <Th label="Qty" field="quantity" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
                <Th label="Shipping Country" field="shippingCountry" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <Th label="Reporting Country" field="reportingCountry" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Override</th>
                <Th label="Purchase Date" field="purchaseDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <Th label="Total Emissions" field="emissionsTotal" sortField={sortField} sortDir={sortDir} onSort={handleSort} align="right" />
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lifecycle Split</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">PCF</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((d, i) => <DeviceRow key={d.id} device={d} striped={i % 2 === 1} />)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <PageBtn label="←" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = i + 1
                return (
                  <PageBtn
                    key={pg}
                    label={pg}
                    onClick={() => setPage(pg)}
                    active={page === pg}
                  />
                )
              })}
              {totalPages > 7 && <span className="px-2 text-gray-400 text-[12px] self-center">…</span>}
              <PageBtn label="→" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function Select({ label, value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 cursor-pointer"
    >
      {options.map(o => (
        <option key={o} value={o}>{o === 'All' ? `${label}: All` : o}</option>
      ))}
    </select>
  )
}

function Th({ label, field, sortField, sortDir, onSort, align = 'left' }) {
  const active = sortField === field
  return (
    <th
      className={`px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-800 transition-colors text-${align}`}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1 justify-start">
        {label}
        {active
          ? sortDir === 'asc'
            ? <ChevronUp size={12} className="text-[#e2231a]" />
            : <ChevronDown size={12} className="text-[#e2231a]" />
          : <ChevronsUpDown size={11} className="text-gray-300" />
        }
      </span>
    </th>
  )
}

function DeviceRow({ device: d, striped }) {
  const { value, unit } = formatEmissions(d.emissionsTotal)
  const mfgPct = Math.round((d.emissionsManufacturing / d.emissionsTotal) * 100)
  const usePct = Math.round((d.emissionsUsePhase / d.emissionsTotal) * 100)
  const trnPct = Math.round((d.emissionsTransport / d.emissionsTotal) * 100)
  const eolPct = 100 - mfgPct - usePct - trnPct

  return (
    <tr className={`border-b border-gray-50 hover:bg-red-50/20 transition-colors ${striped ? 'bg-gray-50/30' : ''}`}>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-[12.5px] leading-tight">{d.model}</div>
        <div className="text-[11px] text-gray-400">{d.productFamily} · {d.manufacturer}</div>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge cat={d.category} />
      </td>
      <td className="px-4 py-3">
        <Badge variant={d.condition === 'Refurbished' ? 'refurbished' : 'default'}>
          {d.condition}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatNumber(d.quantity)}</td>
      <td className="px-4 py-3 text-gray-600">{d.shippingCountry}</td>
      <td className="px-4 py-3 text-gray-800 font-medium">{d.reportingCountry}</td>
      <td className="px-4 py-3">
        {d.reportingCountryOverride
          ? <Badge variant="amber">Override</Badge>
          : <span className="text-gray-300 text-[11px]">—</span>
        }
      </td>
      <td className="px-4 py-3 text-gray-500">{d.purchaseDate}</td>
      <td className="px-4 py-3 text-right">
        <span className="font-bold text-gray-900">{value}</span>
        <span className="text-gray-400 text-[11px] ml-0.5">{unit}</span>
      </td>
      <td className="px-4 py-3">
        <LifecycleBar mfg={mfgPct} use={usePct} trn={trnPct} eol={eolPct} />
      </td>
      <td className="px-4 py-3 text-right">
        <a
          href={d.pcf_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium text-gray-600 hover:text-[#e2231a] hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors whitespace-nowrap"
        >
          <Download size={11} />
          Download PCF
        </a>
      </td>
    </tr>
  )
}

function CategoryBadge({ cat }) {
  const map = {
    Laptop: 'blue', Desktop: 'purple', Workstation: 'red',
    Monitor: 'green', Tablet: 'amber', Accessory: 'default',
  }
  return <Badge variant={map[cat] || 'default'}>{cat}</Badge>
}

function LifecycleBar({ mfg, use, trn, eol }) {
  return (
    <div className="w-20">
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        <div className="bg-[#e2231a]" style={{ width: `${mfg}%` }} title={`Mfg ${mfg}%`} />
        <div className="bg-blue-500" style={{ width: `${use}%` }} title={`Use ${use}%`} />
        <div className="bg-emerald-500" style={{ width: `${trn}%` }} title={`Transport ${trn}%`} />
        <div className="bg-gray-300" style={{ width: `${Math.max(eol, 1)}%` }} title={`EoL ${eol}%`} />
      </div>
      <div className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">{mfg}% mfg · {use}% use</div>
    </div>
  )
}

function PageBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded text-[12px] font-medium transition-colors
        ${active ? 'bg-[#e2231a] text-white' : 'text-gray-500 hover:bg-gray-100'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {label}
    </button>
  )
}
