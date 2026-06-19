import Icon from './Icon.jsx'

const CARDS = [
  {
    key:      'total',
    label:    'Machines',
    sub:      'All monitored',
    icon:     'monitor',
    bar:      '#0969da',
    numClass: 'text-[#24292f]',
    iconBg:   'bg-[#f6f8fa]',
    iconCls:  'text-[#57606a]',
    tag:      'Total',
    tagCls:   'bg-[#ddf4ff] text-[#0969da]',
  },
  {
    key:      'high',
    label:    'High Risk',
    sub:      'Immediate attention',
    icon:     'triangle',
    bar:      '#cf222e',
    numClass: 'text-[#cf222e]',
    iconBg:   'bg-[#ffebe9]',
    iconCls:  'text-[#cf222e]',
    tag:      'Critical',
    tagCls:   'bg-[#ffebe9] text-[#cf222e]',
  },
  {
    key:      'medium',
    label:    'Medium Risk',
    sub:      'Monitor closely',
    icon:     'info',
    bar:      '#9a6700',
    numClass: 'text-[#9a6700]',
    iconBg:   'bg-[#fff8c5]',
    iconCls:  'text-[#9a6700]',
    tag:      'Watch',
    tagCls:   'bg-[#fff8c5] text-[#9a6700]',
  },
  {
    key:      'low',
    label:    'Healthy',
    sub:      'Operating normally',
    icon:     'check',
    bar:      '#1a7f37',
    numClass: 'text-[#1a7f37]',
    iconBg:   'bg-[#dafbe1]',
    iconCls:  'text-[#1a7f37]',
    tag:      'Normal',
    tagCls:   'bg-[#dafbe1] text-[#1a7f37]',
  },
]

// summary = { total, high, medium, low } — comes from API
// covers ALL machines, not just current page
const KPICards = ({ summary, loading }) => {
  const values = {
    total:  summary?.total  ?? 0,
    high:   summary?.high   ?? 0,
    medium: summary?.medium ?? 0,
    low:    summary?.low    ?? 0,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-white
                    border border-[#d0d7de] rounded-md overflow-hidden">
      {CARDS.map((c, i) => (
        <div key={c.key}
          className={`relative p-4 flex flex-col gap-2
            ${i < CARDS.length - 1 ? 'border-r border-[#d0d7de]' : ''}
            ${i >= 2 ? 'border-t md:border-t-0 border-[#d0d7de]' : ''}`}
        >
          {/* Icon + tag */}
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-md ${c.iconBg} flex items-center
                            justify-center border border-[#d0d7de]`}>
              <Icon name={c.icon} size={15} className={c.iconCls} />
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.tagCls}`}>
              {c.tag}
            </span>
          </div>

          {/* Number */}
          <div className={`text-2xl font-bold leading-none tracking-tight ${c.numClass}`}>
            {loading
              ? <div className="h-8 w-10 bg-[#eaeef2] rounded animate-pulse" />
              : values[c.key]
            }
          </div>

          {/* Label + sub */}
          <div>
            <div className="text-[13px] font-semibold text-[#24292f]">{c.label}</div>
            <div className="text-[11px] text-[#6e7781] mt-0.5">{c.sub}</div>
          </div>

          {/* Color bar — proportional to total */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#eaeef2]">
            {!loading && values.total > 0 && (
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min((values[c.key] / values.total) * 100, 100)}%`,
                  background: c.bar,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KPICards