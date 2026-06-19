import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

const LINKS = [
  { label: 'Dashboard', icon: 'grid',    path: '/'         },
  { label: 'Machines',  icon: 'monitor', path: '/machines' },
  { label: 'Alerts',    icon: 'bell',    path: '/alerts'   },
  { label: 'History',   icon: 'clock',   path: '/history'  },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { pathname }    = useLocation()

  return (
    <>
      <nav className="bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-13 flex items-center gap-1">

          {/* Logo — stays on the left */}
          <Link to="/"
            className="flex items-center gap-2.5 shrink-0 no-underline">
            <div className="w-7 h-7 bg-[#0969da] rounded-md flex items-center justify-center">
              <Icon name="activity" size={14} className="text-white" strokeWidth={2.25} />
            </div>
            <span className="text-white font-semibold text-[14px] tracking-tight">
              SmartMaint
            </span>
          </Link>

          {/* Spacer pushes nav links to the right */}
          <div className="flex-1" />

          {/* Desktop nav links — now on the right */}
          <div className="hidden md:flex items-stretch h-13 -mb-px">
            {LINKS.map(l => {
              const active = pathname === l.path
              return (
                <Link key={l.label} to={l.path}
                  className={`flex items-center gap-2 px-4 text-[13px] font-medium
                    no-underline transition-colors border-b-2
                    ${active
                      ? 'text-white border-b-[#0969da]'
                      : 'text-[#9198a1] border-b-transparent hover:text-white'
                    }`}
                >
                  <Icon name={l.icon} size={14} />
                  {l.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(true)}
            className="md:hidden ml-auto w-8 h-8 flex items-center justify-center
                       text-[#9198a1] hover:text-white rounded-md
                       hover:bg-[#161b22] transition-colors cursor-pointer
                       border-none bg-transparent">
            <Icon name="menu" size={18} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer — unchanged */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-[#0d1117] border-r border-[#21262d]
                          flex flex-col p-4 z-10">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#0969da] rounded-md flex items-center justify-center">
                  <Icon name="activity" size={14} className="text-white" strokeWidth={2.25} />
                </div>
                <span className="text-white font-semibold text-[14px]">SmartMaint</span>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-[#9198a1] hover:text-white border-none bg-transparent cursor-pointer">
                <Icon name="x" size={18} />
              </button>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest
                          text-[#484f58] px-2 mb-2">
              Navigation
            </p>
            <div className="flex flex-col gap-0.5">
              {LINKS.map(l => {
                const active = pathname === l.path
                return (
                  <Link key={l.label} to={l.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md
                      text-[13px] font-medium no-underline transition-colors
                      ${active
                        ? 'bg-[#161b22] text-white'
                        : 'text-[#9198a1] hover:bg-[#161b22] hover:text-white'
                      }`}
                  >
                    <Icon name={l.icon} size={15} />
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar