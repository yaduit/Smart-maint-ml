import { useState, useEffect } from 'react'
import { getMachines, getAlerts, startPredictions } from '../services/api.js'
import KPICards     from '../components/KPIcards.jsx'
import SensorChart  from '../components/SensorChart.jsx'
import MachineTable from '../components/MachineTable.jsx'
import AlertPanel   from '../components/AlertPanel.jsx'
import UploadPanel  from '../components/UploadPanel.jsx'
import Icon         from '../components/Icon.jsx'
import Layout       from '../components/Layout.jsx'

const Dashboard = () => {
  const [machines,   setMachines]   = useState([])
  const [alerts,     setAlerts]     = useState([])
  const [summary,    setSummary]    = useState({ total: 0, high: 0, medium: 0, low: 0 })
  const [loading,    setLoading]    = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [lastSync,   setLastSync]   = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const [mRes, aRes] = await Promise.all([
          getMachines(page, 30),
          getAlerts(),
        ])
        if (cancelled) return

        const { machines: list, totalPages: tp, summary: sum } = mRes.data
        setMachines(list    || [])
        setTotalPages(tp    || 1)
        setSummary(sum      || { total: 0, high: 0, medium: 0, low: 0 })
        setAlerts(aRes.data || [])
        setLastSync(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        )
      } catch (err) {
        if (!cancelled) console.error('Load error:', err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [page])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const [mRes, aRes] = await Promise.all([
        getMachines(page, 30),
        getAlerts(),
      ])
      const { machines: list, totalPages: tp, summary: sum } = mRes.data
      setMachines(list    || [])
      setTotalPages(tp    || 1)
      setSummary(sum      || { total: 0, high: 0, medium: 0, low: 0 })
      setAlerts(aRes.data || [])
      setLastSync(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    } catch (err) {
      console.error('Refresh error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRunPredictions = async () => {
    setPredicting(true)
    try {
      await startPredictions()
      const [mRes, aRes] = await Promise.all([
        getMachines(page, 30),
        getAlerts(),
      ])
      const { machines: list, totalPages: tp, summary: sum } = mRes.data
      setMachines(list    || [])
      setTotalPages(tp    || 1)
      setSummary(sum      || { total: 0, high: 0, medium: 0, low: 0 })
      setAlerts(aRes.data || [])
      setLastSync(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    } catch (err) {
      console.error('Prediction error:', err.response?.data?.error || err.message)
    } finally {
      setPredicting(false)
    }
  }

  const handlePrev = () => setPage(p => Math.max(p - 1, 1))
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages))
  const isBusy     = loading || predicting

  return (
    <Layout>
      <div className="flex flex-col gap-4">

        {/* Page heading */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold text-[#24292f] tracking-tight">
              Dashboard
            </h1>
            <p className="text-[12px] text-[#57606a] mt-0.5">
              Predictive maintenance · {summary.total} machines monitored
              {lastSync && (
                <span className="ml-2 text-[#6e7781]">· Synced {lastSync}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRefresh} disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                text-[12px] font-semibold border border-[#d0d7de] bg-[#f6f8fa]
                text-[#24292f] hover:bg-[#eaeef2] transition-colors
                disabled:opacity-50 cursor-pointer">
              <Icon name="refresh" size={12}
                className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={handleRunPredictions} disabled={isBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                text-[12px] font-semibold border border-transparent
                bg-[#0969da] text-white hover:bg-[#0860ca] transition-colors
                disabled:opacity-50 cursor-pointer">
              <Icon name="bolt" size={12}
                className={predicting ? 'animate-pulse' : ''} />
              {predicting ? 'Running…' : 'Run Predictions'}
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <KPICards summary={summary} loading={loading} />

        <div className="flex flex-col md:flex-row
                        border border-[#d0d7de] rounded-md overflow-hidden
                        bg-white md:h-[580px]">

          {/* LEFT — machine list (fixed 280px width on desktop) */}
          <div className="shrink-0 w-full md:w-[280px]
                          border-b md:border-b-0 md:border-r border-[#d0d7de]">
            <MachineTable
              machines={machines}
              total={summary.total}
              page={page}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
              selected={selected}
              onSelect={setSelected}
              loading={loading}
            />
          </div>

          {/* RIGHT — chart on top (60%), alerts below (40%) */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* SensorChart — flex-[3] = 60% of 580px = ~348px */}
            <div className="flex-[3] min-h-0 border-b border-[#d0d7de]">
              <SensorChart
                key={`chart-p${page}`}
                machines={machines}
                loading={loading}
              />
            </div>

            {/* AlertPanel — flex-[2] = 40% of 580px = ~232px */}
            <div className="flex-[2] min-h-0">
              <AlertPanel alerts={alerts} loading={loading} />
            </div>

          </div>
        </div>

        {/* Upload — full width below the container */}
        <UploadPanel onDataRefresh={() => setPage(1)} />

      </div>
    </Layout>
  )
}

export default Dashboard