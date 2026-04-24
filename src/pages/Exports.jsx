import { useState } from 'react'
import {
  Download, FileText, ChevronRight, CheckCircle2,
  Calendar, Database, Hash, ArrowRight, Info,
} from 'lucide-react'
import { EXPORT_CONFIGS, EXPORT_META, runExport } from '../lib/exportMappers'
import { Toast, useToast } from '../components/Toast'

export default function Exports() {
  const [selectedId, setSelectedId] = useState('gri')
  const { toast, show, dismiss } = useToast()

  const selected = EXPORT_CONFIGS.find(c => c.id === selectedId)

  function handleDownload(config) {
    runExport(config)
    show(`${config.label} downloaded`, `${EXPORT_META.recordCount} records · ${config.filename}`)
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Page header */}
      <div>
        <p className="text-[13px] text-gray-500 mt-1 max-w-xl">
          Generate framework-aligned CSV files from the Carbon Impact dataset. Select an export type to preview its structure, then download.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-amber-800 leading-relaxed">
          These exports are structured to support common reporting frameworks using demo data and{' '}
          <strong>are not final compliance submissions</strong>. Columns and methodology notes are
          illustrative of how a production integration would present this data to each framework.
        </p>
      </div>

      {/* Main layout: selector + preview */}
      <div className="flex gap-5 items-start">
        {/* Left: export type list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {EXPORT_CONFIGS.map(config => (
            <ExportTypeCard
              key={config.id}
              config={config}
              selected={selectedId === config.id}
              onSelect={() => setSelectedId(config.id)}
            />
          ))}
        </div>

        {/* Right: preview panel */}
        {selected && (
          <PreviewPanel
            config={selected}
            onDownload={() => handleDownload(selected)}
          />
        )}
      </div>

      {/* Quick-download strip */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Download All</p>
        <div className="flex flex-wrap gap-2">
          {EXPORT_CONFIGS.map(config => (
            <button
              key={config.id}
              onClick={() => handleDownload(config)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all hover:shadow-sm ${config.accentBg} ${config.accentBorder} ${config.accentText}`}
            >
              <Download size={12} />
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <Toast
        message={toast.message}
        detail={toast.detail}
        visible={toast.visible}
        onDismiss={dismiss}
      />
    </div>
  )
}

// ── Export type selector card ─────────────────────────────────────────────────

function ExportTypeCard({ config, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
        selected
          ? `${config.accentBg} ${config.accentBorder} shadow-sm`
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[13.5px] font-semibold ${selected ? config.accentText : 'text-gray-900'}`}>
              {config.label}
            </span>
            {config.frameworkTag && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${config.badgeBg} ${config.accentBorder} ${config.accentText}`}>
                {config.frameworkTag}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-gray-400 mt-0.5 leading-snug">{config.subtitle}</p>
        </div>
        <ChevronRight
          size={14}
          className={`flex-shrink-0 mt-0.5 transition-colors ${selected ? config.accentText : 'text-gray-300'}`}
        />
      </div>
    </button>
  )
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ config, onDownload }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 border-b ${config.accentBg} ${config.accentBorder}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className={`text-[17px] font-bold tracking-tight ${config.accentText}`}>
                  {config.label}
                </h2>
                {config.frameworkTag && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${config.badgeBg} ${config.accentBorder} ${config.accentText}`}>
                    {config.frameworkTag}
                  </span>
                )}
                <DemoBadge />
              </div>
              <p className="text-[13px] text-gray-500 mt-1">{config.subtitle}</p>
            </div>
            <button
              onClick={onDownload}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Download size={14} />
              Download CSV
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 grid grid-cols-3 gap-4">
          <MetaItem icon={Hash} label="Records" value={`${EXPORT_META.recordCount} rows`} />
          <MetaItem icon={Calendar} label="Reporting Period" value={EXPORT_META.reportingPeriod} />
          <MetaItem icon={Database} label="File" value={config.filename} mono />
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2">About this export</p>
          <p className="text-[13.5px] text-gray-700 leading-relaxed">{config.description}</p>
        </div>

        {/* Column preview */}
        <div className="px-6 py-5">
          <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Columns included · {config.columns.length} fields
          </p>
          <div className="flex flex-wrap gap-2">
            {config.columns.map((col, i) => (
              <span
                key={col}
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11.5px] font-medium text-gray-600"
              >
                <span className="text-gray-300 text-[10px] font-bold tabular-nums w-4 text-right">{i + 1}</span>
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] text-gray-400">
            {EXPORT_META.recordCount} records · {EXPORT_META.deviceCount.toLocaleString()} devices · {EXPORT_META.reportingPeriod}
          </span>
          <button
            onClick={onDownload}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[12.5px] font-semibold transition-all hover:shadow-sm ${config.accentBg} ${config.accentBorder} ${config.accentText}`}
          >
            <Download size={13} />
            Download {config.label}
          </button>
        </div>
      </div>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={12} className="text-gray-400" />
      </div>
      <div>
        <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-[12.5px] font-semibold text-gray-800 mt-0.5 ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
      Demo Export
    </span>
  )
}
