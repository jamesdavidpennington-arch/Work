import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Cpu, Globe2, Recycle, Zap, RefreshCw, X,
  ExternalLink, Info, TrendingUp, ChevronRight,
} from 'lucide-react'
import {
  devices,
  getTotalEmissions, getTotalDevices, getRefurbishedCount,
  getCountries, getEmissionsByReportingCountry, getEmissionsByCategory,
  getEmissionsByLifecycleStage, getEmissionsByGHGScope, getEmissionsByQuarter,
  getEmissionsByOffsetType,
} from '../data/mockData'
import {
  getARSSummary, formatGBP, DEPRECIATION_CURVE,
  CONDITION_MULTIPLIERS, CATEGORY_MODIFIERS,
} from '../lib/arsCalculator'
import { Card, CardHeader, Stat, formatNumber, formatEmissions } from '../components/ui'

const PALETTE = ['#e2231a', '#1e40af', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d']
const LIFECYCLE_COLORS = { Manufacturing: '#e2231a', 'Use Phase': '#1e40af', Transport: '#059669', 'End of Life': '#9ca3af' }
const SCOPE_COLORS = { 'Scope 3': '#e2231a', 'Scope 2': '#1e40af', 'Scope 1': '#059669' }
const OFFSET_COLORS = { 'No Offsets': '#9ca3af', 'Avoidance': '#059669', 'Removals': '#0891b2' }

// ── Static derivations (computed once at module load) ─────────────────────────

const totalKg = getTotalEmissions()
const totalDevices = getTotalDevices()
const refurbCount = getRefurbishedCount()
const countryCount = getCountries().length
const emissionsFormatted = formatEmissions(totalKg)

const countryData = getEmissionsByReportingCountry().slice(0, 10)
const categoryData = getEmissionsByCategory()
const lifecycleData = getEmissionsByLifecycleStage()
const scopeData = getEmissionsByGHGScope()
const quarterData = getEmissionsByQuarter()
const offsetData = getEmissionsByOffsetType()

const refurbShare = ((refurbCount / totalDevices) * 100).toFixed(1)
const topCountry = countryData[0]
const topCategory = categoryData[0]
const topLifecycle = [...lifecycleData].sort((a, b) => b.emissions - a.emissions)[0]

const insights = [
  `${topCountry.country} is the largest emitting region, contributing ${((topCountry.emissions / totalKg) * 100).toFixed(0)}% of total portfolio emissions.`,
  `${topCategory.category}s represent the highest emission category at ${((topCategory.emissions / totalKg) * 100).toFixed(0)}% of total.`,
  `${topLifecycle.stage} is the dominant lifecycle phase, accounting for ${((topLifecycle.emissions / totalKg) * 100).toFixed(0)}% of device footprint.`,
  `Refurbished devices account for ${refurbShare}% of deployed units — extending device life reduces manufacturing-phase emissions by up to 40%.`,
]

const arsSummary = getARSSummary(devices)

// ── Shared tooltip ────────────────────────────────────────────────────────────

function EmissionsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const { value, unit } = formatEmissions(val)
  const name =
    payload[0].payload.country ||
    payload[0].payload.category ||
    payload[0].payload.stage ||
    payload[0].payload.scope ||
    payload[0].payload.period ||
    payload[0].payload.label || ''
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3.5 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-800 mb-0.5">{name}</p>
      <p className="text-gray-500">{value} {unit}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [arsModalOpen, setArsModalOpen] = useState(false)

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Carbon KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Total Emissions"
          value={emissionsFormatted.value}
          unit={emissionsFormatted.unit}
          delta="Across all devices & regions"
          color="red"
          icon={Zap}
        />
        <Stat
          label="Total Devices"
          value={formatNumber(totalDevices)}
          unit="units"
          delta={`${[...new Set(devices.map(d => d.model))].length} models deployed`}
          icon={Cpu}
        />
        <Stat
          label="Countries"
          value={countryCount}
          unit="regions"
          delta="By reporting country"
          icon={Globe2}
        />
        <Stat
          label="Refurbished Share"
          value={`${refurbShare}%`}
          delta={`${formatNumber(refurbCount)} of ${formatNumber(totalDevices)} devices`}
          color="green"
          icon={Recycle}
        />
      </div>

      {/* ARS KPI card — prominent commercial insight */}
      <ARSCard summary={arsSummary} onOpenDetail={() => setArsModalOpen(true)} />

      {/* Emissions over time + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Emissions Over Time" subtitle="By quarter of purchase / acquisition date (kg CO₂e)" />
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={quarterData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="emGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e2231a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e2231a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}t`}
                  width={36}
                />
                <Tooltip content={<EmissionsTooltip />} />
                <Area
                  type="monotone" dataKey="emissions" stroke="#e2231a" strokeWidth={2}
                  fill="url(#emGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#e2231a', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Key Insights" subtitle="Auto-generated from portfolio data" />
          <div className="px-5 py-4 space-y-3">
            {insights.map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#e2231a]">{i + 1}</span>
                </div>
                <p className="text-[12.5px] text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* By country */}
      <Card>
        <CardHeader title="Emissions by Reporting Country" subtitle="Top 10 countries · kg CO₂e" />
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}t`} width={36} />
              <Tooltip content={<EmissionsTooltip />} />
              <Bar dataKey="emissions" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {countryData.map((_, i) => <Cell key={i} fill={i === 0 ? '#e2231a' : '#e5e7eb'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category + Lifecycle + Scope + Offsets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader title="By Product Category" subtitle="Total kg CO₂e" />
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}t`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<EmissionsTooltip />} />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Lifecycle Stage Breakdown" subtitle="Total portfolio" />
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={lifecycleData} dataKey="emissions" nameKey="stage"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3}>
                  {lifecycleData.map(entry => (
                    <Cell key={entry.stage} fill={LIFECYCLE_COLORS[entry.stage] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip content={<EmissionsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {lifecycleData.map(d => {
                const { value, unit } = formatEmissions(d.emissions)
                return (
                  <div key={d.stage} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: LIFECYCLE_COLORS[d.stage] }} />
                      <span className="text-gray-600">{d.stage}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {value} <span className="text-gray-400 font-normal">{unit}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="GHG Scope Distribution" subtitle="Per GHG Protocol scope" />
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={scopeData} dataKey="emissions" nameKey="scope"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3}>
                  {scopeData.map(entry => (
                    <Cell key={entry.scope} fill={SCOPE_COLORS[entry.scope] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip content={<EmissionsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {scopeData.map(d => {
                const { value, unit } = formatEmissions(d.emissions)
                return (
                  <div key={d.scope} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: SCOPE_COLORS[d.scope] }} />
                      <span className="text-gray-600">{d.scope}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {value} <span className="text-gray-400 font-normal">{unit}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Offsets" subtitle="Breakdown by offset type" />
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={offsetData} dataKey="emissions" nameKey="label"
                  cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3}>
                  {offsetData.map(entry => (
                    <Cell key={entry.label} fill={OFFSET_COLORS[entry.label] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip content={<EmissionsTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {offsetData.map(d => {
                const tonnes = d.emissions / 1000
                const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(tonnes)
                return (
                  <div key={d.label} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: OFFSET_COLORS[d.label] }} />
                      <span className="text-gray-600">{d.label}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatted} <span className="text-gray-400 font-normal">tCO₂e</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* ARS detail modal */}
      {arsModalOpen && (
        <ARSDetailModal summary={arsSummary} onClose={() => setArsModalOpen(false)} />
      )}
    </div>
  )
}

// ── ARS KPI card ──────────────────────────────────────────────────────────────

function ARSCard({ summary, onOpenDetail }) {
  const arsFormatted = formatGBP(summary.totalARSValue, true)

  return (
    <div
      onClick={onOpenDetail}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="px-5 py-5 flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Left: icon + headline metric */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={15} className="text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">Potential ARS Value</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                Demo Estimate
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[26px] font-bold leading-none tracking-tight text-emerald-600">
                {arsFormatted}
              </span>
            </div>
            <p className="text-[12px] text-gray-400 mt-1.5">
              Estimated recoverable value across {formatNumber(summary.eligibleUnitCount)} eligible devices
            </p>
          </div>
        </div>

        {/* Center: key stats */}
        <div className="flex gap-6 lg:gap-8 lg:border-l lg:border-r border-gray-100 lg:px-8">
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Eligible Devices</p>
            <p className="text-[20px] font-bold text-gray-900 mt-0.5">{formatNumber(summary.eligibleUnitCount)}</p>
            <p className="text-[11px] text-gray-400">of {formatNumber(summary.totalUnitCount)} total</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Avg Residual</p>
            <p className="text-[20px] font-bold text-gray-900 mt-0.5">{summary.avgResidualPct}%</p>
            <p className="text-[11px] text-gray-400">of original value</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Top Category</p>
            <p className="text-[20px] font-bold text-gray-900 mt-0.5 truncate max-w-[100px]">
              {summary.byCategory[0]?.category ?? '—'}
            </p>
            <p className="text-[11px] text-gray-400">by recovery value</p>
          </div>
        </div>

        {/* Right: description + CTA */}
        <div className="flex flex-col gap-3 lg:w-56 flex-shrink-0">
          <p className="text-[11.5px] text-gray-400 leading-relaxed">
            Demo estimate based on mock depreciation curves, original device values, age, and condition.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.lenovo.com/gb/en/services/asset-recovery-services/?srsltid=AfmBOorrkklLl99ntJPSFnDeb7LCyAxv9GraSGe3jNlmRsoHF6e_vvFc"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              <ExternalLink size={12} />
              Find out more about ARS
            </a>
            <button
              onClick={onOpenDetail}
              className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              <TrendingUp size={12} />
              View breakdown
              <ChevronRight size={11} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer strip */}
      <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/60 flex items-center gap-2">
        <Info size={11} className="text-gray-300 flex-shrink-0" />
        <p className="text-[10.5px] text-gray-400">
          Potential ARS Value is a demo estimate based on sample depreciation logic and mock fleet data. It is illustrative only and not a commercial quote.
        </p>
      </div>
    </div>
  )
}

// ── ARS detail modal ──────────────────────────────────────────────────────────

function ARSDetailModal({ summary, onClose }) {
  const maxCatValue = summary.byCategory[0]?.value ?? 1
  const maxCntValue = summary.byCountry[0]?.value ?? 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <RefreshCw size={14} className="text-emerald-600" />
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">Potential ARS Value — Breakdown</h2>
            </div>
            <p className="text-[12px] text-gray-400 mt-1 ml-9">Lenovo Asset Recovery Services · Demo estimate · Mock data</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-800 leading-relaxed">
              This breakdown is a <strong>demo estimate</strong> based on mock depreciation curves, original device values, age, and condition grade. It is illustrative only and does not constitute a commercial quote or formal ARS valuation.
            </p>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total ARS Value', value: formatGBP(summary.totalARSValue, true), highlight: true },
              { label: 'Eligible Devices', value: formatNumber(summary.eligibleUnitCount) },
              { label: 'Eligible Records', value: summary.eligibleRecordCount },
              { label: 'Avg Residual', value: `${summary.avgResidualPct}%` },
            ].map(t => (
              <div key={t.label} className={`rounded-xl px-4 py-3 border ${t.highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">{t.label}</p>
                <p className={`text-[19px] font-bold mt-1 ${t.highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{t.value}</p>
              </div>
            ))}
          </div>

          {/* By category */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">ARS Value by Product Category</p>
            <div className="space-y-2.5">
              {summary.byCategory.map(item => (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="text-[12.5px] text-gray-600 w-24 flex-shrink-0">{item.category}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(item.value / maxCatValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-[12.5px] font-semibold text-gray-800 w-20 text-right flex-shrink-0">
                    {formatGBP(item.value, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* By country */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">ARS Value by Reporting Country (Top 8)</p>
            <div className="space-y-2.5">
              {summary.byCountry.map((item, i) => (
                <div key={item.country} className="flex items-center gap-3">
                  <span className="text-[12.5px] text-gray-600 w-28 flex-shrink-0 truncate">{item.country}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.value / maxCntValue) * 100}%`,
                        background: i === 0 ? '#059669' : '#d1fae5',
                      }}
                    />
                  </div>
                  <span className="text-[12.5px] font-semibold text-gray-800 w-20 text-right flex-shrink-0">
                    {formatGBP(item.value, true)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Depreciation curve */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Mock Depreciation Curve</p>
            <div className="rounded-lg border border-gray-100 overflow-hidden text-[12px]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Age Band</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Base Residual</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Condition Multipliers</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPRECIATION_CURVE.map((band, i) => (
                    <tr key={band.label} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="px-4 py-2.5 text-gray-700">{band.label}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{(band.residual * 100).toFixed(0)}%</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">
                        {i === 0 && Object.entries(CONDITION_MULTIPLIERS).map(([k, v]) => `${k}: ×${v}`).join(' · ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 bg-gray-50/60 border-t border-gray-100 text-[11px] text-gray-400">
                Category modifiers also applied:&nbsp;
                {Object.entries(CATEGORY_MODIFIERS).map(([k, v]) => `${k} ×${v}`).join(' · ')}
              </div>
            </div>
          </div>

          {/* ARS link */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-[12px] text-gray-400">Contact Lenovo to explore actual fleet recovery options.</p>
            <a
              href="https://www.lenovo.com/gb/en/services/asset-recovery-services/?srsltid=AfmBOorrkklLl99ntJPSFnDeb7LCyAxv9GraSGe3jNlmRsoHF6e_vvFc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-[12.5px] font-semibold hover:bg-emerald-800 transition-colors"
            >
              <ExternalLink size={13} />
              Find out more about ARS
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
