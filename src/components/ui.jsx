// Shared presentational primitives

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-50">
      <div>
        <h3 className="text-[13.5px] font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}

export function Stat({ label, value, unit, delta, color = 'default', icon: Icon }) {
  const colorMap = {
    default: 'text-gray-900',
    red:     'text-[#e2231a]',
    green:   'text-emerald-600',
    blue:    'text-blue-600',
    amber:   'text-amber-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <Icon size={15} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-[26px] font-bold leading-none tracking-tight ${colorMap[color]}`}>{value}</span>
        {unit && <span className="text-[13px] text-gray-400 font-medium">{unit}</span>}
      </div>
      {delta && (
        <p className="mt-2 text-[12px] text-gray-400">{delta}</p>
      )}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default:      'bg-gray-100 text-gray-600',
    green:        'bg-emerald-50 text-emerald-700',
    blue:         'bg-blue-50 text-blue-700',
    amber:        'bg-amber-50 text-amber-700',
    red:          'bg-red-50 text-red-700',
    purple:       'bg-purple-50 text-purple-700',
    refurbished:  'bg-teal-50 text-teal-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">{children}</h2>
      {subtitle && <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export function formatNumber(n, decimals = 0) {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

export function formatEmissions(kgCo2e) {
  if (kgCo2e >= 1_000_000) return { value: (kgCo2e / 1_000_000).toFixed(2), unit: 'kt CO₂e' }
  if (kgCo2e >= 1_000) return { value: (kgCo2e / 1_000).toFixed(1), unit: 't CO₂e' }
  return { value: kgCo2e.toFixed(0), unit: 'kg CO₂e' }
}

export function EmissionsValue({ kgCo2e, className = '' }) {
  const { value, unit } = formatEmissions(kgCo2e)
  return (
    <span className={className}>
      {value} <span className="text-gray-400 font-normal">{unit}</span>
    </span>
  )
}
