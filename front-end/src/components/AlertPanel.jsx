import Icon from './Icon.jsx'

const SEV = {
  critical: {
    dot:   'bg-[#cf222e]',
    badge: 'bg-[#ffebe9] text-[#cf222e] border-[#ffc1c0]',
    label: 'Critical',
  },
  warning: {
    dot:   'bg-[#9a6700]',
    badge: 'bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]',
    label: 'Warning',
  },
}

const TYPE = {
  threshold:     { label: 'Threshold', cls: 'bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]' },
  ml_prediction: { label: 'ML Model',  cls: 'bg-[#ddf4ff] text-[#0969da] border-[#b6d7fb]' },
}

const AlertPanel = ({ alerts, loading }) => {
  const critical = alerts.filter(a => a.severity === 'critical').length

  return (
    /*
      h-full fills the flex-[2] parent (≈ 232px at 580px container).
      flex-col: header / scrollable list.
      List: flex-1 + overflow-y-auto → scrolls when alerts exceed space.
      No inline maxHeight — flex-1 computes the exact correct height.
    */
    <div className="h-full flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-[#d0d7de] bg-[#f6f8fa] shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="bell" size={13} className="text-[#57606a]" />
          <span className="text-[13px] font-semibold text-[#24292f]">
            Active Alerts
          </span>
        </div>

        {/* Alert count badge */}
        {loading ? (
          <div className="w-14 h-4 bg-[#eaeef2] rounded-full animate-pulse" />
        ) : critical > 0 ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                           bg-[#ffebe9] text-[#cf222e] border border-[#ffc1c0]">
            {critical} critical
          </span>
        ) : (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                           bg-[#dafbe1] text-[#1a7f37] border border-[#82e79a]">
            All clear
          </span>
        )}
      </div>

      {/*
        ── Alert list ──────────────────────────────────────────
        flex-1 + overflow-y-auto + min-h-0 → fills remaining height,
        scrolls when alerts overflow.
        Removing maxHeight: 220 — flex-1 handles it correctly.
      */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">

        {loading ? (
          // Skeleton rows
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i}
              className="flex gap-3 px-4 py-3 border-b border-[#d8dee4]">
              <div className="w-2 h-2 rounded-full bg-[#eaeef2]
                              animate-pulse mt-1 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-[#eaeef2] rounded animate-pulse" />
                <div className="h-2.5 w-full bg-[#eaeef2] rounded animate-pulse" />
              </div>
            </div>
          ))

        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center
                          h-full text-[#6e7781]">
            <Icon name="check" size={18}
              className="mb-1.5 text-[#1a7f37] opacity-70" />
            <p className="text-[12px] font-medium text-[#1a7f37]">
              No active alerts
            </p>
            <p className="text-[11px] text-[#6e7781] mt-0.5">
              All machines operating normally
            </p>
          </div>

        ) : alerts.map((a, i) => {
            const s = SEV[a.severity] || SEV.warning
            const t = TYPE[a.type]    || TYPE.threshold
            return (
              <div key={i}
                className={`flex gap-3 px-4 py-2.5 hover:bg-[#f6f8fa]
                  transition-colors
                  ${i < alerts.length - 1 ? 'border-b border-[#d8dee4]' : ''}`}
              >
                {/* Severity dot */}
                <div className="pt-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Machine ID + badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[12px] font-semibold
                                     text-[#24292f] font-mono">
                      {a.machine_id}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5
                      rounded-full border ${s.badge}`}>
                      {s.label}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5
                      rounded-full border ${t.cls}`}>
                      {t.label}
                    </span>
                  </div>
                  {/* Message */}
                  <p className="text-[11px] text-[#57606a] leading-relaxed
                                truncate">
                    {a.message}
                  </p>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default AlertPanel