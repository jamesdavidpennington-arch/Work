import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts'
import { Info, ArrowRight } from 'lucide-react'
import { devices, getEmissionsByReportingCountry, getCountryComparisonData } from '../data/mockData'
import { Card, CardHeader, Badge, formatEmissions, formatNumber } from '../components/ui'

const reportingData = getEmissionsByReportingCountry()
const comparisonData = getCountryComparisonData()

const overrideRecords = devices.filter(d => d.reportingCountryOverride)
const totalOverrideDevices = overrideRecords.reduce((s, d) => s + d.quantity, 0)
const totalOverrideEmissions = overrideRecords.reduce((s, d) => s + d.emissionsTotal, 0)

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3.5 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map(p => {
        const { value: v, unit: u } = formatEmissions(p.value)
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-semibold text-gray-800">{v} {u}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Geography() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Explainer banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex gap-3">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-[13px] text-blue-800 leading-relaxed">
          <strong>Geography methodology:</strong> Emissions are reported against the <strong>shipping country</strong> by default.
          Where Lenovo determines the end-user or operating entity is in a different country, a <strong>reporting country override</strong> is applied.
          This page compares both views and highlights records where the two differ.
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Total Countries (Reporting)" value={reportingData.length} />
        <KpiTile label="Countries (Shipping)" value={[...new Set(devices.map(d => d.shippingCountry))].length} />
        <KpiTile label="Override Records" value={overrideRecords.length} sub={`${totalOverrideDevices.toLocaleString()} devices`} />
        <KpiTile
          label="Emissions in Override Records"
          value={(() => { const f = formatEmissions(totalOverrideEmissions); return `${f.value} ${f.unit}` })()}
          highlight
        />
      </div>

      {/* Bar: reporting country */}
      <Card>
        <CardHeader
          title="Emissions by Reporting Country"
          subtitle="Total kg CO₂e — reporting country used as primary geographic dimension"
        />
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reportingData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}t`}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="emissions" name="Reporting Emissions" radius={[4, 4, 0, 0]} maxBarSize={42}>
                {reportingData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#e2231a' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Shipping vs Reporting comparison */}
      <Card>
        <CardHeader
          title="Shipping Country vs Reporting Country"
          subtitle="Side-by-side comparison — countries with overrides show differing values"
          action={
            <Badge variant="amber">{overrideRecords.length} override rows</Badge>
          }
        />
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={comparisonData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}t`}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="shippingEmissions" name="Shipping Country" fill="#e5e7eb" radius={[3, 3, 0, 0]} maxBarSize={22} />
              <Bar dataKey="reportingEmissions" name="Reporting Country" fill="#e2231a" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Override records table */}
      <Card>
        <CardHeader
          title="Reporting Country Override Records"
          subtitle="Devices where reporting country differs from shipping country"
        />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Model', 'Category', 'Qty', 'Shipping Country', '', 'Reporting Country', 'Purchase Date', 'Emissions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overrideRecords.map((d, i) => {
                const { value, unit } = formatEmissions(d.emissionsTotal)
                return (
                  <tr key={d.id} className={`border-b border-gray-50 hover:bg-amber-50/30 ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{d.model}</div>
                      <div className="text-[11px] text-gray-400">{d.manufacturer}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.category}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{formatNumber(d.quantity)}</td>
                    <td className="px-4 py-3 text-gray-500">{d.shippingCountry}</td>
                    <td className="px-4 py-3">
                      <ArrowRight size={14} className="text-amber-400" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-amber-700">{d.reportingCountry}</span>
                      <Badge variant="amber" className="ml-2">Override</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.purchaseDate}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {value} <span className="text-gray-400 font-normal text-[11px]">{unit}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function KpiTile({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl border px-5 py-4 shadow-sm ${highlight ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-[22px] font-bold leading-none ${highlight ? 'text-[#e2231a]' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
