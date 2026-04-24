import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, User, RotateCcw,
  Lightbulb, Leaf, Briefcase, Building2, Info, ArrowRight,
} from 'lucide-react'
import { LissaLogo } from '../components/LissaLogo'
import {
  generateLissaResponse,
  SUGGESTED_PROMPTS,
  WELCOME_MESSAGE,
  LISSA_VERSION,
} from '../lib/lissaEngine'

// ── Response section config ───────────────────────────────────────────────────
// Add, remove, or reorder sections here without touching the render logic.

const RESPONSE_SECTIONS = [
  {
    key: 'recommendation',
    label: 'Recommendation',
    icon: Lightbulb,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
  {
    key: 'carbonPerspective',
    label: 'Carbon Perspective',
    icon: Leaf,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
  },
  {
    key: 'commercialPerspective',
    label: 'Commercial Perspective',
    icon: Briefcase,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    borderColor: 'border-blue-100',
  },
  {
    key: 'lenovoRelevance',
    label: 'Lenovo Relevance',
    icon: Building2,
    iconColor: 'text-[#e2231a]',
    iconBg: 'bg-red-50',
    borderColor: 'border-red-100',
  },
  {
    key: 'assumptions',
    label: 'Assumptions',
    icon: Info,
    iconColor: 'text-gray-400',
    iconBg: 'bg-gray-50',
    borderColor: 'border-gray-100',
  },
  {
    key: 'nextStep',
    label: 'Next Step',
    icon: ArrowRight,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    borderColor: 'border-purple-100',
  },
]

// ── Avatars ───────────────────────────────────────────────────────────────────

function LissaAvatar({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const logoSize = size === 'sm' ? 26 : 30
  return (
    <div className={`${dim} rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0`}>
      <LissaLogo size={logoSize} />
    </div>
  )
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <User size={15} className="text-gray-500" />
    </div>
  )
}

// ── Thinking indicator ────────────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <LissaAvatar />
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            {[0, 150, 300].map(delay => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
          <span className="text-[12px] text-gray-400">LISSA is thinking…</span>
        </div>
      </div>
    </div>
  )
}

// ── Structured response view ──────────────────────────────────────────────────

function StructuredResponseView({ content }) {
  return (
    <div className="space-y-3">
      {RESPONSE_SECTIONS.map(({ key, label, icon: Icon, iconColor, iconBg, borderColor }) => {
        const text = content[key]
        if (!text) return null
        return (
          <div key={key} className={`rounded-xl border ${borderColor} bg-white px-4 py-3`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={11} className={iconColor} />
              </div>
              <span className={`text-[10.5px] font-bold uppercase tracking-wider ${iconColor}`}>{label}</span>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed">{text}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Message bubbles ───────────────────────────────────────────────────────────

function UserBubble({ message }) {
  return (
    <div className="flex items-end justify-end gap-3 px-4 py-2">
      <div className="max-w-[75%]">
        <div className="bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-3 text-[13.5px] leading-relaxed">
          {message.content}
        </div>
        <p className="text-[10px] text-gray-300 text-right mt-1 px-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
      <UserAvatar />
    </div>
  )
}

function AssistantBubble({ message }) {
  const isWelcome = typeof message.content === 'string'
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <LissaAvatar />
      <div className="max-w-[85%] min-w-0">
        {isWelcome ? (
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3.5">
            <p className="text-[13.5px] text-gray-800 leading-relaxed">{message.content}</p>
          </div>
        ) : (
          <StructuredResponseView content={message.content} />
        )}
        <p className="text-[10px] text-gray-300 mt-1 px-1">
          LISSA · {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  if (message.role === 'user') return <UserBubble message={message} />
  return <AssistantBubble message={message} />
}

// ── Suggested prompts ─────────────────────────────────────────────────────────

function SuggestedPrompts({ onSelect }) {
  return (
    <div className="px-4 pt-1 pb-3">
      <p className="text-[11px] text-gray-400 mb-2.5 ml-11">Suggested questions to get started:</p>
      <div className="ml-11 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[12px] text-gray-600 hover:border-red-200 hover:text-[#e2231a] hover:bg-red-50 transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Input area ────────────────────────────────────────────────────────────────

function InputArea({ input, setInput, onSend, disabled, inputRef }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask LISSA about carbon, devices, procurement, or Lenovo…"
            disabled={disabled}
            rows={1}
            aria-label="Message LISSA"
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[13.5px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#e2231a] text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-center text-[10.5px] text-gray-300 mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Lissa() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const hasUserMessages = messages.some(m => m.role === 'user')

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSend = useCallback(async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim()
    if (!text || isThinking) return

    setError(null)

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      // FUTURE INTEGRATION POINT: generateLissaResponse will be replaced
      // with a call to a real AI/RAG backend. The history array enables
      // multi-turn context. See src/lib/lissaEngine.js for details.
      const response = await generateLissaResponse(text, [...messages, userMessage])

      const assistantMessage = {
        id: `lissa-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsThinking(false)
      // Return focus to input after response
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, isThinking, messages])

  function handleReset() {
    setMessages([WELCOME_MESSAGE])
    setInput('')
    setIsThinking(false)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <LissaLogo size={40} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">LISSA</h2>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest border border-gray-200 rounded px-1.5 py-0.5">
                    v{LISSA_VERSION}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Lenovo Intelligent Sustainability &amp; Solutions Advisor
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasUserMessages && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw size={12} />
                  New conversation
                </button>
              )}
            </div>
          </div>

          {/* POC Disclaimer */}
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
            <Info size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              <strong>POC disclaimer:</strong> LISSA currently provides simplified demonstration responses.
              Future versions should use approved Lenovo sources, product carbon footprint data,
              corporate ESG information, and retrieval-augmented generation.
            </p>
          </div>
        </div>
      </div>

      {/* ── Message list ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto py-3">
        <div className="max-w-3xl mx-auto">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Suggested prompts — shown below welcome before first user message */}
          {!hasUserMessages && (
            <SuggestedPrompts onSelect={handleSend} />
          )}

          {/* Thinking indicator */}
          {isThinking && <ThinkingBubble />}

          {/* Error state */}
          {error && (
            <div className="px-4 py-2 ml-11">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] text-red-700">
                <Info size={13} />
                {error}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <InputArea
        input={input}
        setInput={setInput}
        onSend={handleSend}
        disabled={isThinking}
        inputRef={inputRef}
      />
    </div>
  )
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
