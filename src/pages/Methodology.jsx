import {
  Database, Globe2, Recycle, Layers, BarChart3, Factory,
  Truck, Zap, Trash2, GitBranch, Info, CheckCircle2, RefreshCw,
} from 'lucide-react'
import { Card } from '../components/ui'
import { DEPRECIATION_CURVE, CONDITION_MULTIPLIERS, CATEGORY_MODIFIERS } from '../lib/arsCalculator'

export default function Methodology() {
  return (
    <div className="space-y-6 max-w-[900px]">
      {/* Demo banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[13px] text-amber-800 leading-relaxed">
          This portal uses <strong>mock data for demonstration purposes only</strong>. All device records, quantities,
          and emissions figures are representative examples based on publicly available product carbon footprint values.
          They do not represent any specific customer's actual emissions inventory.
        </p>
      </div>

      <Section icon={Database} title="Data Model Overview">
        <p>
          The Carbon Impact Portal aggregates two categories of data: <strong>purchase/device records</strong> (what
          devices were acquired, in what quantity, and when) and <strong>product carbon footprint (PCF) records</strong>
          (the per-unit lifecycle emissions associated with each model). These two datasets are joined on product model
          to derive total portfolio emissions.
        </p>
        <p className="mt-3">
          The data model is <strong>manufacturer-agnostic</strong>. Each device record carries a{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">manufacturer</code> field, and the PCF
          library can hold footprint values from any vendor. The current demo focuses on Lenovo devices,
          but future versions can incorporate data from Dell, HP, Apple, or any other manufacturer without structural changes.
        </p>
      </Section>

      <Section icon={BarChart3} title="Emissions Calculation">
        <FormulaBlock>
          Total Emissions = Per-Unit PCF × Quantity
        </FormulaBlock>
        <p className="mt-3">
          Where <strong>Per-Unit PCF</strong> is the product carbon footprint (kg CO₂e) from the manufacturer's
          lifecycle assessment (LCA), and <strong>Quantity</strong> is the number of units in a purchase record.
        </p>
        <p className="mt-3">
          For <strong>refurbished devices</strong>, the manufacturing phase footprint is reduced by 40% to reflect
          the avoided manufacturing burden of a second-life device. Transport, use phase, and end-of-life figures
          remain unchanged.
        </p>
      </Section>

      <Section icon={Layers} title="Lifecycle Stages">
        <p className="mb-4">Emissions are disaggregated into four lifecycle stages consistent with ISO 14040/44 and the GHG Protocol Product Standard:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LifecycleCard icon={Factory} name="Manufacturing" color="red" description="Raw material extraction, component production, and device assembly. Typically the largest single stage for IT hardware." />
          <LifecycleCard icon={Truck} name="Transport" color="green" description="Logistics and distribution from manufacturing facility to end customer, including all transport modes." />
          <LifecycleCard icon={Zap} name="Use Phase" color="blue" description="Electricity consumption during device operation over the assumed service life, using market-average grid emission factors." />
          <LifecycleCard icon={Trash2} name="End of Life" color="gray" description="Collection, disassembly, recycling, and disposal at the end of the product's useful life." />
        </div>
      </Section>

      <Section icon={GitBranch} title="GHG Scope Allocation">
        <p className="mb-4">
          Emissions are also classified by GHG Protocol scope, enabling customers to integrate this data
          into their enterprise Scope 3 Category 1 (Purchased Goods &amp; Services) reporting:
        </p>
        <div className="space-y-2">
          <ScopeRow scope="Scope 1" description="Direct combustion emissions from manufacturing processes — a small share of total." color="green" />
          <ScopeRow scope="Scope 2" description="Indirect electricity-related emissions from manufacturing facilities and device use phase." color="blue" />
          <ScopeRow scope="Scope 3" description="All other upstream and downstream value chain emissions — the dominant share for IT products." color="red" />
        </div>
        <p className="mt-4 text-[13px] text-gray-500">
          Note: For enterprise customers, the emissions reported here are typically classified as <strong>Scope 3 Category 11 (Use of Sold Products)</strong> from Lenovo's perspective,
          but appear as <strong>Scope 3 Category 1 (Purchased Goods &amp; Services)</strong> in the customer's own GHG inventory.
        </p>
      </Section>

      <Section icon={Globe2} title="Geographic Reporting">
        <ul className="space-y-3">
          <Li>
            <strong>Shipping country</strong> is the default geographic dimension — this is the country to which
            Lenovo delivered the device as recorded in the purchase order.
          </Li>
          <Li>
            A <strong>reporting country override</strong> field is available on each record. Where Lenovo determines
            that the end-user or operating entity is in a different country (e.g. a centralised procurement hub
            shipping to subsidiary offices), the reporting country override is applied and used in geographic aggregations.
          </Li>
          <Li>
            The Geography page shows both views side-by-side and highlights all records where the two countries differ.
          </Li>
        </ul>
      </Section>

      <Section icon={Recycle} title="Refurbished Devices">
        <p>
          Refurbished and second-life devices are supported where product carbon footprint data exists.
          The data model includes a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">condition</code> field
          (New or Refurbished) on every device record. The Devices page allows filtering by condition,
          and the Overview Dashboard shows the refurbished share of the total fleet.
        </p>
        <p className="mt-3">
          Extending device lifetimes through refurbishment is one of the most impactful strategies available
          to enterprise customers — deferring or eliminating a new manufacturing cycle can reduce per-device
          emissions by up to 40–60% depending on the product category.
        </p>
      </Section>

      <Section icon={RefreshCw} title="Potential ARS Value — Asset Recovery Estimate">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mb-4">
          <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-800">
            <strong>Demo estimate only.</strong> The Potential ARS Value shown on the Overview Dashboard is illustrative
            and does not constitute a commercial quote or formal Lenovo ARS valuation.
          </p>
        </div>
        <p>
          The <strong>Potential ARS Value</strong> KPI provides an indicative estimate of the recoverable commercial value
          of a customer's eligible fleet through{' '}
          <strong>Lenovo Asset Recovery Services (ARS)</strong>. It is calculated entirely client-side from mock
          data using a simplified depreciation model, and is intended to demonstrate how circular-economy insights
          could sit alongside carbon reporting in a production version of this portal.
        </p>

        <p className="mt-3 font-medium text-gray-700">Calculation formula:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-[12.5px] text-gray-800 my-3 text-center">
          ARS Value = Original Unit Price × Quantity × Depreciation Factor × Condition Multiplier × Category Modifier
        </div>

        <p className="font-medium text-gray-700 mt-4 mb-2">Mock depreciation curve (by device age):</p>
        <div className="rounded-lg border border-gray-100 overflow-hidden mb-4">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left font-semibold text-gray-500">Age Band</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-500">Base Residual %</th>
              </tr>
            </thead>
            <tbody>
              {DEPRECIATION_CURVE.map((band, i) => (
                <tr key={band.label} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                  <td className="px-4 py-2 text-gray-700">{band.label}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-800">{(band.residual * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-medium text-gray-700 mb-2">Condition multipliers:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(CONDITION_MULTIPLIERS).map(([grade, mult]) => (
            <span key={grade} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700">
              {grade.charAt(0).toUpperCase() + grade.slice(1)}: ×{mult}
            </span>
          ))}
        </div>

        <p className="font-medium text-gray-700 mb-2">Category modifiers:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(CATEGORY_MODIFIERS).map(([cat, mod]) => (
            <span key={cat} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700">
              {cat}: ×{mod}
            </span>
          ))}
        </div>

        <ul className="space-y-2 text-[13px] text-gray-600">
          <Li>Device age is calculated relative to a fixed demo reference date (April 2026).</Li>
          <Li>Only devices marked <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">arsEligible = true</code> in the data model are included in the total. Accessories are excluded.</Li>
          <Li>A real ARS valuation would use Lenovo's proprietary business rules, grading assessments, and current secondary-market pricing.</Li>
          <Li>The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">originalUnitPrice</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">conditionGrade</code>, and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px] font-mono">arsEligible</code> fields on each device record are designed to be populated by a future data integration.</Li>
        </ul>
      </Section>

      <Section icon={Info} title="Reporting Date Basis">
        <p>
          Emissions are attributed to the <strong>purchase date</strong> (acquisition date) of each device record.
          This is consistent with a carbon accounting approach that recognises emissions at the point of procurement.
          Future versions of this portal may support alternative date bases such as deployment date or fiscal year allocation.
        </p>
      </Section>

      <Card className="px-5 py-5 bg-gray-50/80">
        <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Future Capabilities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Live data ingestion from purchase systems',
            'Multi-manufacturer PCF library',
            'Custom reporting periods and fiscal calendars',
            'Scope 3 Category 11 customer reporting templates',
            'Device-level carbon reduction recommendations',
            'Integration with enterprise ESG platforms',
            'Verified PCF data from manufacturer disclosures',
            'Net-zero pathway scenario modelling',
          ].map(item => (
            <div key={item} className="flex items-start gap-2 text-[12.5px] text-gray-600">
              <CheckCircle2 size={13} className="text-gray-300 flex-shrink-0 mt-0.5" />
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="px-6 py-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-[#e2231a]" />
        </div>
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      </div>
      <div className="text-[13px] text-gray-600 leading-relaxed">
        {children}
      </div>
    </Card>
  )
}

function FormulaBlock({ children }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-[13px] text-gray-800 text-center">
      {children}
    </div>
  )
}

function LifecycleCard({ icon: Icon, name, color, description }) {
  const colors = { red: 'bg-red-50 text-[#e2231a]', green: 'bg-emerald-50 text-emerald-600', blue: 'bg-blue-50 text-blue-600', gray: 'bg-gray-100 text-gray-500' }
  return (
    <div className="flex gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-gray-800 mb-0.5">{name}</p>
        <p className="text-[12px] text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ScopeRow({ scope, description, color }) {
  const colors = { red: 'bg-red-50 text-red-700 border-red-100', blue: 'bg-blue-50 text-blue-700 border-blue-100', green: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  return (
    <div className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
      <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold flex-shrink-0 ${colors[color]}`}>{scope}</span>
      <p className="text-[13px] text-gray-600">{description}</p>
    </div>
  )
}

function Li({ children }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="text-[#e2231a] font-bold flex-shrink-0 mt-px">·</span>
      <span>{children}</span>
    </li>
  )
}
