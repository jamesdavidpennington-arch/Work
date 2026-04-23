import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import {
  Cpu, Globe2, Package, Recycle, TrendingUp, Zap, Factory, Truck
} from 'lucide-react'
import {
  devices,
  getTotalEmissions, getTotalDevices, getRefurbishedCount,
  getCountries, getEmissionsByReportingCountry, getEmissionsByCategory,
  getEmissionsByLifecycleStage, getEmissionsByGHGScope, getEmissionsByQuarter,
} from '../data/mockData'
import { Card, CardHeader, Stat, formatNumber, formatEmissions } from '../components/ui'

const PALETTE = ['#e2231a', '#1e40af', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d']
const LIFECYCLE_COLORS = { Manufacturing: '#e2231a', 'Use Phase': '#1e40af', Transport: '#059669', 'End of Life': '#9ca3af' }
const SCOPE_COLORS = { 'Scope 3': '#e2231a', 'Scope 2': '#1e40af', 'Scope 1': '#059669' }

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

const topCountry = countryData[0]
const topCategory = categoryData[0]
const refurbShare = ((refurbCount / totalDevices) * 100).toFixed(1)
const topLifecycle = [...lifecycleData].sort((a, b) => b.emissions - a.emissions)[0]

const insights = [
  `${topCountry.country} is the largest emitting region, contributing ${((topCountry.emissions / totalKg) * 100).toFixed(0)}% of total portfolio emissions.`,
  `${topCategory.category}s represent the highest emission category at ${((topCategory.emissions / totalKg) * 100).toFixed(0)}% of total.`,
  `${topLifecycle.stage} is the dominant lifecycle phase, accounting for ${((topLifecycle.emissions / totalKg) * 100).toFixed(0)}% of device footprint.`,
  `Refurbished devices account for ${refurbShare}% of deployed units — extending device life reduces manufacturing-phase emissions by up to 40%.`,
]

function CustomTooltip({ active, payload, label, valueKey = 'emissions', prefix = '' }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const { value, unit } = formatEmissions(val)
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3.5 py-2.5 text-[12px]">
      <p className="font-semibold text-gray-800 mb-0.5">{prefix}{label || payload[0].payload.country || payload[0].payload.category || payload[0].payload.stage || payload[0].payload.scope || payload[0].payload.period}</p>
      <p className="text-gray-500">{value} {unit}</p>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* KPI Cards */}
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

      {/* Emissions over time + by country */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend */}
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
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}t`}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="emissions"
                  stroke="#e2231a"
                  strokeWidth={2}
                  fill="url(#emGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#e2231a', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Insights */}
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

      {/* By country bar */}
      <Card>
        <CardHeader title="Emissions by Reporting Country" subtitle="Top 10 countries · kg CO₂e" />
        <div className="px-5 py-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
              <Bar dataKey="emissions" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {countryData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#e2231a' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category + Lifecycle + Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Category */}
        <Card>
          <CardHeader title="By Product Category" subtitle="Total kg CO₂e" />
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}t`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="emissions" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lifecycle Stage */}
        <Card>
          <CardHeader title="Lifecycle Stage Breakdown" subtitle="Total portfolio" />
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={lifecycleData}
                  dataKey="emissions"
                  nameKey="stage"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {lifecycleData.map((entry) => (
                    <Cell key={entry.stage} fill={LIFECYCLE_COLORS[entry.stage] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
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
                    <span className="font-semibold text-gray-800">{value} <span className="text-gray-400 font-normal">{unit}</span></span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* GHG Scope */}
        <Card>
          <CardHeader title="GHG Scope Distribution" subtitle="Per GHG Protocol scope" />
          <div className="px-5 py-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={scopeData}
                  dataKey="emissions"
                  nameKey="scope"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {scopeData.map(entry => (
                    <Cell key={entry.scope} fill={SCOPE_COLORS[entry.scope] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
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
                    <span className="font-semibold text-gray-800">{value} <span className="text-gray-400 font-normal">{unit}</span></span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
