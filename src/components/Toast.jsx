import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export function Toast({ message, detail, visible, onDismiss }) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-gray-900 text-white px-4 py-3.5 rounded-xl shadow-2xl max-w-xs transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight">{message}</p>
        {detail && <p className="text-[11.5px] text-gray-400 mt-0.5 leading-tight">{detail}</p>}
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors flex-shrink-0 ml-1">
        <X size={13} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', detail: '' })

  const show = (message, detail = '') => {
    setToast({ visible: true, message, detail })
  }

  const dismiss = () => setToast(t => ({ ...t, visible: false }))

  return { toast, show, dismiss }
}
