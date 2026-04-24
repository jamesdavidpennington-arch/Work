import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Monitor,
  Globe2,
  BookOpen,
  Leaf,
  ChevronRight,
  FileDown,
  Sparkles,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Monitor },
  { to: '/geography', label: 'Geography', icon: Globe2 },
]

const NAV_ITEMS_SECONDARY = [
  { to: '/exports', label: 'Exports', icon: FileDown },
  { to: '/methodology', label: 'Methodology', icon: BookOpen },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fb]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  )
}

// Strips padding and disables outer scroll for the LISSA chat page so the
// chat interface can manage its own full-height flex layout.
function MainContent({ children }) {
  const { pathname } = useLocation()
  const isChat = pathname === '/lissa'
  return (
    <main className={`flex-1 ${isChat ? 'overflow-hidden' : 'overflow-y-auto p-6 lg:p-8'}`}>
      {children}
    </main>
  )
}

function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#e2231a] rounded-md flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-bold text-gray-900 tracking-tight">Carbon Impact</div>
            <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <SidebarLink to="/lissa" label="LISSA" icon={Sparkles} highlight />
        <div className="pt-3 pb-1.5">
          <div className="h-px bg-gray-100" />
        </div>

        <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Analytics</p>
        {NAV_ITEMS.map(item => (
          <SidebarLink key={item.to} {...item} />
        ))}

        <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Reporting</p>
        {NAV_ITEMS_SECONDARY.map(item => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/320px-Lenovo_logo_2015.svg.png"
            alt="Lenovo"
            className="h-4 object-contain opacity-60"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="text-[10px] text-gray-400 ml-auto">FY 2023–2024</span>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ to, label, icon: Icon, highlight }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => {
        if (highlight) {
          return `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-semibold transition-all ${
            isActive
              ? 'bg-red-50 text-[#e2231a]'
              : 'text-gray-700 hover:bg-gray-50 hover:text-[#e2231a]'
          }`
        }
        return `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all ${
          isActive
            ? 'bg-red-50 text-[#e2231a]'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`
      }}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            className={
              isActive
                ? 'text-[#e2231a]'
                : highlight
                  ? 'text-gray-500'
                  : 'text-gray-400'
            }
          />
          <span>{label}</span>
          {isActive && <ChevronRight size={14} className="ml-auto text-[#e2231a] opacity-60" />}
        </>
      )}
    </NavLink>
  )
}

function Topbar() {
  const location = useLocation()
  const pageTitle = {
    '/':            'Overview Dashboard',
    '/devices':     'Device Inventory',
    '/geography':   'Geographic Analysis',
    '/exports':     'Framework Exports',
    '/methodology': 'Methodology',
    '/lissa':       'LISSA — Sustainability & Solutions Advisor',
  }[location.pathname] || 'Carbon Impact Portal'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 lg:px-8 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-[15px] font-semibold text-gray-900">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Demo Environment
        </span>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-[12px] text-gray-400">Mock data · FY 2023–2024</span>
      </div>
    </header>
  )
}
