import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

const RISK = {
  High:    { label: 'High', cls: 'bg-[#ffebe9] text-[#cf222e] border-[#ffc1c0]' },
  Medium:  { label: 'Med',  cls: 'bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]' },
  Low:     { label: 'Low',  cls: 'bg-[#dafbe1] text-[#1a7f37] border-[#82e79a]' },
  Unknown: { label: '—',    cls: 'bg-[#f6f8fa] text-[#6e7781] border-[#d0d7de]' },
}

const DOT = {
  High:    'bg-[#cf222e]',
  Medium:  'bg-[#9a6700]',
  Low:     'bg-[#1a7f37]',
  Unknown: 'bg-[#d0d7de]',
}

const MachineTable = ({
  machines,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
  selected,
  onSelect,
  loading,
}) => {
  const [query, setQuery] = useState('')

  const visible = query.trim()
    ? machines.filter(m =>
        m.machine_id?.toLowerCase().includes(query.trim().toLowerCase()))
    : machines

  // Range label: e.g. "1–30 of 342"
  const start = total > 0 ? (page - 1) * 30 + 1 : 0
  const end   = total > 0 ? Math.min(start + machines.length - 1, total) : 0

  return (
    /*
      h-full   → fills the 580px grid cell
      flex-col → stacks: header / search / [selected link] / col-labels / rows / footer
      All fixed sections have shrink-0 so they never compress.
      Rows section: flex-1 + overflow-y-auto + min-h-0 → scrollable,
      fills remaining space → ~11 rows visible at 580px container height.
    */
    <div className="h-full flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-[#d0d7de] bg-[#f6f8fa] shrink-0">
        <span className="text-[13px] font-semibold text-[#24292f]">
          Machine Status
        </span>
        <span className="text-[11px] text-[#6e7781] bg-white
                         border border-[#d0d7de] px-2 py-0.5 rounded-full">
          {loading ? '…' : `${total} total`}
        </span>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="px-3 py-2 border-b border-[#d0d7de] bg-[#f6f8fa] shrink-0">
        <div className="relative">
          <Icon name="search" size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6e7781]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter this page…"
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white
                       border border-[#d0d7de] rounded-md outline-none
                       placeholder:text-[#6e7781] text-[#24292f]
                       focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/20
                       transition-shadow"
          />
        </div>
      </div>

      {/* ── Selected machine quick-link (conditional) ──────── */}
      {selected?.machine_id && (
        <div className="px-4 py-2 border-b border-[#d0d7de]
                        bg-[#ddf4ff] shrink-0">
          <Link
            to={`/alerts?machine=${encodeURIComponent(selected.machine_id)}`}
            className="text-[12px] font-semibold text-[#0969da]
                       hover:underline no-underline">
            View alerts for {selected.machine_id} →
          </Link>
        </div>
      )}

      {/* ── Column labels ──────────────────────────────────── */}
      <div className="flex items-center px-4 py-1.5
                      border-b border-[#d8dee4] bg-[#f6f8fa] shrink-0">
        <span className="flex-1 text-[10px] font-semibold uppercase
                         tracking-wider text-[#6e7781]">
          Machine ID
        </span>
        <span className="w-16 text-center text-[10px] font-semibold
                         uppercase tracking-wider text-[#6e7781]">
          Risk
        </span>
        <span className="w-10 text-right text-[10px] font-semibold
                         uppercase tracking-wider text-[#6e7781]">
          Prob
        </span>
      </div>

      {/*
        ── Rows — scrollable ───────────────────────────────────
        flex-1 + min-h-0 lets this fill exactly the space between
        column labels and the pagination footer.
        overflow-y-auto enables scroll when rows exceed the space.
        At 580px container → ~11 rows visible, rest scrollable.
      */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          // Skeleton rows
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i}
              className="flex items-center gap-3 px-4 py-2.5
                         border-b border-[#d8dee4]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#eaeef2] shrink-0" />
              <div className="flex-1 h-3 bg-[#eaeef2] rounded animate-pulse" />
              <div className="w-12 h-4 bg-[#eaeef2] rounded animate-pulse" />
              <div className="w-8 h-3 bg-[#eaeef2] rounded animate-pulse" />
            </div>
          ))
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center
                          h-full text-[#6e7781]">
            <Icon name="search" size={18} className="mb-2 opacity-40" />
            <p className="text-[12px]">
              {query ? 'No machines match filter' : 'Upload CSV first'}
            </p>
          </div>
        ) : (
          visible.map(m => {
            const r     = RISK[m.risk_level] || RISK.Unknown
            const isSel = selected?.machine_id === m.machine_id
            return (
              <div key={m.machine_id}
                onClick={() => onSelect(m)}
                className={`flex items-center px-4 py-2.5
                  border-b border-[#d8dee4] cursor-pointer
                  transition-colors border-l-2
                  ${isSel
                    ? 'bg-[#ddf4ff] border-l-[#0969da]'
                    : 'hover:bg-[#f6f8fa] border-l-transparent'
                  }`}
              >
                {/* Risk dot */}
                <div className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0
                  ${DOT[m.risk_level] || DOT.Unknown}`} />

                {/* Machine ID */}
                <span className="flex-1 min-w-0 text-[12px] font-medium
                                 text-[#24292f] font-mono truncate mr-2">
                  {m.machine_id}
                </span>

                {/* Risk badge */}
                <span className={`w-16 inline-flex items-center justify-center
                  text-[10px] font-semibold px-2 py-0.5 rounded-full border
                  shrink-0 ${r.cls}`}>
                  {r.label}
                </span>

                {/* Probability */}
                <span className="w-10 text-right text-[12px] text-[#57606a]
                                 tabular-nums shrink-0">
                  {m.probability != null
                    ? `${(m.probability * 100).toFixed(0)}%`
                    : '—'
                  }
                </span>
              </div>
            )
          })
        )}
      </div>

      {/*
        ── Pagination footer ───────────────────────────────────
        shrink-0 keeps it always visible at the bottom.
        Shows range label + Prev / page count / Next.
      */}
      <div className="px-4 py-2.5 border-t border-[#d0d7de]
                      bg-[#f6f8fa] shrink-0">
        <div className="flex items-center justify-between gap-2">

          {/* Range label */}
          <span className="text-[11px] text-[#6e7781] tabular-nums">
            {loading
              ? '…'
              : total > 0
                ? `${start}–${end} of ${total}`
                : 'No data'
            }
          </span>

          {/* Prev / page indicator / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md
                text-[11px] font-semibold border border-[#d0d7de] bg-white
                text-[#24292f] hover:bg-[#f6f8fa] transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              ←
              <span className="hidden sm:inline ml-0.5">Prev</span>
            </button>

            <span className="text-[11px] text-[#57606a] px-2 tabular-nums
                             bg-white border border-[#d0d7de] rounded-md py-1">
              {page} / {totalPages}
            </span>

            <button
              onClick={onNext}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md
                text-[11px] font-semibold border border-[#d0d7de] bg-white
                text-[#24292f] hover:bg-[#f6f8fa] transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <span className="hidden sm:inline mr-0.5">Next</span>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MachineTable