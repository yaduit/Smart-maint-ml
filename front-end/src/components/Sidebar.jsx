const NAV = [
  { label: 'Dashboard', id: 'dashboard' },
  { label: 'Machines',  id: 'machines'  },
  { label: 'Alerts',    id: 'alerts'    },
]
const NAV2 = [
  { label: 'History',  id: 'history'  },
  { label: 'Settings', id: 'settings' },
]

const Sidebar = ({ active = 'dashboard' }) => (
  <aside className="w-60 min-h-screen bg-sidebar flex flex-col flex-shrink-0">

    {/* Logo */}
    <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
      <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center
                      text-white text-xs font-bold flex-shrink-0">
        SM
      </div>
      <span className="text-slate-100 font-semibold text-sm">SmartMaint</span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-2 mb-2">
        Main
      </p>
      {NAV.map(item => (
        <div key={item.id}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
            cursor-pointer transition-colors mb-0.5
            ${active === item.id
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0
            ${active === item.id ? 'bg-brand-500' : 'bg-slate-600'}`}
          />
          {item.label}
        </div>
      ))}

      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest
                    px-2 mb-2 mt-5">
        Data
      </p>
      {NAV2.map(item => (
        <div key={item.id}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm
            text-slate-400 hover:text-slate-200 hover:bg-slate-800/50
            cursor-pointer transition-colors mb-0.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0"/>
          {item.label}
        </div>
      ))}
    </nav>

    {/* Bottom status */}
    <div className="px-4 py-4 border-t border-slate-800">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
        Services
      </p>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
        <span className="text-xs text-slate-400">Node.js :3001</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
        <span className="text-xs text-slate-400">Flask :5001</span>
      </div>
    </div>
  </aside>
)

export default Sidebar