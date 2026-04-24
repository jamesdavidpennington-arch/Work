import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Send, X, ExternalLink, RotateCcw, Lightbulb } from 'lucide-react'
import { generateLissaResponse } from '../lib/lissaEngine'
import { LissaLogo } from './LissaLogo'

export function FloatingLissa() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  // Hide on the full LISSA page
  if (pathname === '/lissa') return null

  async function handleSend() {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    setThinking(true)
    setResult(null)
    try {
      const response = await generateLissaResponse(text, [])
      setResult({ question: text, response })
    } catch {
      setResult({ question: text, error: true })
    } finally {
      setThinking(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleReset() {
    setResult(null)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function openFull() {
    navigate('/lissa')
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Panel ── */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
            <LissaLogo size={22} />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-bold text-gray-900 tracking-tight">LISSA</span>
              <span className="ml-2 text-[10px] text-gray-400 font-medium">AI Advisor</span>
            </div>
            <button
              onClick={openFull}
              title="Open full LISSA"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={13} />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3.5">
            {!result && !thinking && (
              <p className="text-[12.5px] text-gray-500 leading-relaxed">
                Ask about carbon impact, device procurement, Lenovo sustainability, or buy&nbsp;vs&nbsp;lease&nbsp;vs&nbsp;DaaS.
              </p>
            )}

            {thinking && (
              <div className="flex items-center gap-2 py-1">
                <span className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
                <span className="text-[11.5px] text-gray-400">LISSA is thinking…</span>
              </div>
            )}

            {result && !result.error && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-gray-400 truncate">
                  <span className="font-medium text-gray-500">You:</span> {result.question}
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lightbulb size={10} className="text-amber-600 flex-shrink-0" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-600">
                      Recommendation
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-700 leading-relaxed line-clamp-5">
                    {result.response.recommendation}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RotateCcw size={10} />
                    Ask another
                  </button>
                  <button
                    onClick={openFull}
                    className="text-[11px] font-semibold text-[#e2231a] hover:underline"
                  >
                    Full analysis →
                  </button>
                </div>
              </div>
            )}

            {result?.error && (
              <div className="space-y-2">
                <p className="text-[12px] text-red-600">Something went wrong. Please try again.</p>
                <button
                  onClick={handleReset}
                  className="text-[11px] text-gray-500 hover:text-gray-700"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          {!result && (
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask LISSA…"
                  disabled={thinking}
                  autoFocus
                  className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={thinking || !input.trim()}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#e2231a] text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">
              POC · Simplified demonstration responses
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open LISSA advisor"
        className="flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-full bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-150"
      >
        <LissaLogo size={30} />
        {!open && (
          <span className="text-[13px] font-semibold text-gray-700 leading-none">
            Ask LISSA
          </span>
        )}
      </button>
    </div>
  )
}
