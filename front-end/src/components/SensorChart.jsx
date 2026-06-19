import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import Icon from './Icon.jsx'

const SENSORS = [
  { key: 'air_temp',     label: 'Air Temp (K)',     threshold: 308  },
  { key: 'process_temp', label: 'Process Temp (K)', threshold: 313  },
  { key: 'rpm',          label: 'RPM',              threshold: 2800 },
  { key: 'torque',       label: 'Torque (Nm)',      threshold: 65   },
  { key: 'tool_wear',    label: 'Tool Wear (min)',  threshold: 200  },
]

const RISK_COLOR = {
  High:    '#cf222e',
  Medium:  '#9a6700',
  Low:     '#1a7f37',
  Unknown: '#8c959f',
}

const CustomTooltip = ({ active, payload, sensorLabel }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-[#d0d7de] rounded-md
                    shadow-lg p-2.5 text-xs z-50">
      <p className="font-semibold text-[#24292f] font-mono mb-1">
        {d.fullId}
      </p>
      <p className="text-[#57606a]">
        {sensorLabel}:{' '}
        <span className="font-semibold text-[#24292f]">
          {d.value?.toFixed(2)}
        </span>
      </p>
      <p style={{ color: RISK_COLOR[d.risk] }}
         className="font-semibold mt-0.5">
        {d.risk} risk
      </p>
    </div>
  )
}

const SensorChart = ({ machines, loading }) => {
  const [active, setActive] = useState(SENSORS[0])

  const data = useMemo(() => machines.map(m => ({
    name:   m.machine_id?.slice(-5) || '—',
    fullId: m.machine_id,
    value:  m[active.key],
    risk:   m.risk_level || 'Unknown',
  })), [machines, active.key])

  return (
    /*
      h-full fills the flex-[3] parent (≈ 348px at 580px container).
      flex-col: header / tabs / chart-body.
      chart-body: flex-1 for the ResponsiveContainer area.

      ResponsiveContainer uses height={190} — a reliable fixed pixel
      height that fits inside the remaining space after header+tabs+padding.
      header ≈ 46px, tabs ≈ 38px, padding ≈ 28px, legend ≈ 28px
      → remaining ≈ 348 - 46 - 38 - 28 - 28 = 208px → 190px is safe.
    */
    <div className="h-full flex flex-col">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-[#d0d7de] bg-[#f6f8fa] shrink-0">
        <span className="text-[13px] font-semibold text-[#24292f]">
          Sensor Overview
        </span>
        <span className="text-[11px] text-[#6e7781]">
          {machines.length} machines
        </span>
      </div>

      {/* ── Sensor selector tabs ───────────────────────────── */}
      <div className="flex border-b border-[#d0d7de] bg-white
                      overflow-x-auto shrink-0">
        {SENSORS.map(s => (
          <button key={s.key}
            onClick={() => setActive(s)}
            className={`px-3 py-2 text-[11px] font-medium whitespace-nowrap
              border-b-2 transition-colors cursor-pointer
              bg-transparent border-t-0 border-x-0 outline-none
              ${active.key === s.key
                ? 'border-b-[#0969da] text-[#0969da]'
                : 'border-b-transparent text-[#57606a] hover:text-[#24292f] hover:bg-[#f6f8fa]'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Chart body ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-4 pt-3 pb-2 bg-white min-h-0">

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#6e7781] text-[12px]">
              <Icon name="activity" size={13} className="animate-pulse" />
              Loading chart…
            </div>
          </div>

        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center
                          text-[#6e7781]">
            <Icon name="activity" size={20} className="mb-2 opacity-40" />
            <p className="text-[12px]">Upload CSV and run predictions</p>
          </div>

        ) : (
          <>
            {/*
              Fixed height 190px — reliable across laptop viewports.
              Recharts height="100%" inside nested flex is unreliable.
            */}
            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={data}
                margin={{ top: 6, right: 12, left: -22, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#eaeef2"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 8, fill: '#57606a', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: '#57606a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip sensorLabel={active.label} />}
                  cursor={{ fill: '#f6f8fa' }}
                />
                <ReferenceLine
                  y={active.threshold}
                  stroke="#cf222e"
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                  label={{
                    value: `${active.threshold}`,
                    position: 'insideTopRight',
                    fontSize: 8,
                    fill: '#cf222e',
                    dy: -4,
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={22}>
                  {data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={RISK_COLOR[entry.risk] || '#8c959f'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* ── Legend ──────────────────────────────────── */}
            <div className="flex items-center gap-3 mt-2 flex-wrap shrink-0">
              {Object.entries(RISK_COLOR)
                .filter(([k]) => k !== 'Unknown')
                .map(([risk, color]) => (
                  <div key={risk} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm"
                         style={{ background: color, opacity: 0.85 }} />
                    <span className="text-[10px] text-[#57606a]">{risk}</span>
                  </div>
                ))
              }
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-4 border-t border-dashed
                                border-[#cf222e] opacity-60" />
                <span className="text-[10px] text-[#57606a]">Threshold</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SensorChart