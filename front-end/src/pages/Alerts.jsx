import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Icon from "../components/Icon.jsx";
import { getAlerts } from "../services/api.js";

const SEV = {
  critical: {
    dot: "bg-[#cf222e]",
    badge: "bg-[#ffebe9] text-[#cf222e] border-[#ffc1c0]",
    label: "Critical",
  },
  warning: {
    dot: "bg-[#9a6700]",
    badge: "bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]",
    label: "Warning",
  },
};

const TYPE = {
  threshold: {
    badge: "bg-[#f6f8fa] text-[#57606a] border-[#d0d7de]",
    label: "Threshold",
    icon: "triangle",
  },
  ml_prediction: {
    badge: "bg-[#ddf4ff] text-[#0969da] border-[#b6d7fb]",
    label: "ML Model",
    icon: "bolt",
  },
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const machineFilter = params.get("machine");

  useEffect(() => {
    getAlerts()
      .then((res) => setAlerts(res.data || []))
      .catch((err) => {
        if (import.meta.env.DEV) console.error(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    threshold: alerts.filter((a) => a.type === "threshold").length,
    ml: alerts.filter((a) => a.type === "ml_prediction").length,
  };

  const TABS = [
    { key: "all", label: "All alerts", count: counts.all },
    { key: "critical", label: "Critical", count: counts.critical },
    { key: "warning", label: "Warning", count: counts.warning },
    { key: "threshold", label: "Threshold", count: counts.threshold },
    { key: "ml", label: "ML Model", count: counts.ml },
  ];

  const filtered = alerts.filter((a) => {
    if (tab === "all") return true;
    if (tab === "critical") return a.severity === "critical";
    if (tab === "warning") return a.severity === "warning";
    if (tab === "threshold") return a.type === "threshold";
    if (tab === "ml") return a.type === "ml_prediction";
    return true;
  });

  const alertsToShow = machineFilter
    ? filtered.filter((a) => a.machine_id === machineFilter)
    : filtered;

  return (
    <Layout>
      {/* Heading */}
      <div className="mb-5">
        <h1 className="text-[20px] font-bold text-[#24292f] tracking-tight">
          Alerts
        </h1>
        <p className="text-[12px] text-[#57606a] mt-0.5">
          {counts.critical} critical · {counts.warning} warning · {counts.ml}{" "}
          ML-flagged
        </p>
        {machineFilter && (
          <p className="text-[12px] text-[#24292f] mt-2">
            Showing alerts for{" "}
            <span className="font-semibold">{machineFilter}</span>
          </p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Total Alerts",
            value: counts.all,
            clr: "text-[#24292f]",
            bg: "",
          },
          {
            label: "Critical",
            value: counts.critical,
            clr: "text-[#cf222e]",
            bg: "bg-[#ffebe9]",
          },
          {
            label: "Warnings",
            value: counts.warning,
            clr: "text-[#9a6700]",
            bg: "bg-[#fff8c5]",
          },
          {
            label: "ML-flagged",
            value: counts.ml,
            clr: "text-[#0969da]",
            bg: "bg-[#ddf4ff]",
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`${c.bg || "bg-white"} border border-[#d0d7de] rounded-md p-4`}
          >
            {loading ? (
              <div className="h-7 w-8 bg-[#eaeef2] rounded animate-pulse mb-1" />
            ) : (
              <div
                className={`text-[26px] font-bold leading-none mb-1 ${c.clr}`}
              >
                {c.value}
              </div>
            )}
            <div className="text-[12px] text-[#57606a] font-medium">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Alert list card */}
      <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#d0d7de] overflow-x-auto bg-[#f6f8fa]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium
                whitespace-nowrap border-b-2 transition-colors cursor-pointer
                bg-transparent border-t-0 border-x-0
                ${
                  tab === t.key
                    ? "border-b-[#0969da] text-[#0969da] bg-white"
                    : "border-b-transparent text-[#57606a] hover:text-[#24292f] hover:bg-white"
                }`}
            >
              {t.label}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                ${
                  tab === t.key
                    ? "bg-[#0969da] text-white"
                    : "bg-[#eaeef2] text-[#6e7781]"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div
          className="overflow-y-auto alert-scrollbar"
          style={{ maxHeight: "calc(100vh - 260px)" }}
        >
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 px-4 py-4 border-b border-[#d8dee4]"
              >
                <div className="w-2 h-2 rounded-full bg-[#eaeef2] animate-pulse mt-1.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-[#eaeef2] rounded animate-pulse" />
                    <div className="h-4 w-14 bg-[#eaeef2] rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-3/4 bg-[#eaeef2] rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : alertsToShow.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6e7781]">
              <Icon
                name="check"
                size={28}
                className="mb-3 text-[#1a7f37] opacity-60"
              />
              <p className="text-[13px] font-medium text-[#1a7f37]">
                No alerts here
              </p>
              <p className="text-[12px] text-[#6e7781] mt-1">
                All machines operating within safe limits
              </p>
            </div>
          ) : (
            alertsToShow.map((a, i) => {
              const s = SEV[a.severity] || SEV.warning;
              const t = TYPE[a.type] || TYPE.threshold;
              return (
                <div
                  key={i}
                  className={`flex gap-3 px-4 py-4 hover:bg-[#f6f8fa] transition-colors
                    ${i < alertsToShow.length - 1 ? "border-b border-[#d8dee4]" : ""}`}
                >
                  <div className="pt-1.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[13px] font-semibold text-[#24292f] font-mono">
                        {a.machine_id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.badge}`}
                      >
                        {s.label}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-medium
                        px-2 py-0.5 rounded-full border ${t.badge}`}
                      >
                        <Icon name={t.icon} size={9} />
                        {t.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#57606a] leading-relaxed">
                      {a.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
