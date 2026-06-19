import { useState, useEffect } from "react";
import Layout from "../components/Layout.jsx";
import Icon from "../components/Icon.jsx";
import { getPredictions } from "../services/api.js";

const RISK_BADGE = {
  High: "bg-[#ffebe9] text-[#cf222e] border-[#ffc1c0]",
  Medium: "bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]",
  Low: "bg-[#dafbe1] text-[#1a7f37] border-[#82e79a]",
  Unknown: "bg-[#f6f8fa] text-[#6e7781] border-[#d0d7de]",
};

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictions()
      .then((res) => setPredictions(res.data || []))
      .catch((err) => {
        if (import.meta.env.DEV) console.error(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const high = predictions.filter((p) => p.risk_level === "High").length;
  const medium = predictions.filter((p) => p.risk_level === "Medium").length;
  const low = predictions.filter((p) => p.risk_level === "Low").length;
  const total = predictions.length;

  const lastRun = predictions[0]?.timestamp
    ? new Date(predictions[0].timestamp).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <Layout>
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-[#24292f] tracking-tight">
            Prediction History
          </h1>
          <p className="text-[12px] text-[#57606a] mt-0.5">
            {lastRun
              ? `Last run · ${lastRun}`
              : "No predictions run yet"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Predictions", value: total, clr: "text-[#24292f]" },
          { label: "High Risk", value: high, clr: "text-[#cf222e]" },
          { label: "Medium Risk", value: medium, clr: "text-[#9a6700]" },
          { label: "Healthy", value: low, clr: "text-[#1a7f37]" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white border border-[#d0d7de] rounded-md p-4"
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

      {/* Distribution bar */}
      {!loading && total > 0 && (
        <div className="bg-white border border-[#d0d7de] rounded-md p-4 mb-5">
          <p className="text-[12px] font-semibold text-[#24292f] mb-3">
            Risk Distribution
          </p>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-px bg-[#eaeef2]">
            {high > 0 && (
              <div
                className="bg-[#cf222e] opacity-80"
                style={{ width: `${(high / total) * 100}%` }}
              />
            )}
            {medium > 0 && (
              <div
                className="bg-[#9a6700] opacity-80"
                style={{ width: `${(medium / total) * 100}%` }}
              />
            )}
            {low > 0 && (
              <div
                className="bg-[#1a7f37] opacity-80"
                style={{ width: `${(low / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            {[
              { label: `High (${high})`, color: "#cf222e" },
              { label: `Medium (${medium})`, color: "#9a6700" },
              { label: `Low (${low})`, color: "#1a7f37" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ background: l.color, opacity: 0.8 }}
                />
                <span className="text-[11px] text-[#57606a]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
        {/* Table header */}
        <div
          className="flex items-center justify-between px-4 py-3
                        border-b border-[#d0d7de] bg-[#f6f8fa]"
        >
          <span className="text-[13px] font-semibold text-[#24292f]">
            Prediction Records
          </span>
          <span
            className="text-[11px] text-[#6e7781] border border-[#d0d7de]
                           bg-white px-2 py-0.5 rounded-full"
          >
            {total} records
          </span>
        </div>

        {/* Column labels */}
        <div className="grid grid-cols-4 px-4 py-2 bg-[#f6f8fa] border-b border-[#d8dee4]">
          {["Machine ID", "Risk Level", "Probability", "Timestamp"].map((h) => (
            <span
              key={h}
              className="text-[10px] font-semibold uppercase tracking-wider text-[#6e7781]"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-4 py-3 border-b border-[#d8dee4] gap-4"
              >
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-3 bg-[#eaeef2] rounded animate-pulse"
                  />
                ))}
              </div>
            ))
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-[#6e7781]">
              <Icon name="clock" size={22} className="mb-2 opacity-40" />
              <p className="text-[12px]">No predictions yet</p>
              <p className="text-[11px] mt-1 text-[#6e7781]">
                Go to Dashboard → Upload CSV → Run Predictions
              </p>
            </div>
          ) : (
            predictions.map((p, i) => (
              <div
                key={p._id || i}
                className={`grid grid-cols-4 items-center px-4 py-2.5
                    hover:bg-[#f6f8fa] transition-colors
                    ${i < predictions.length - 1 ? "border-b border-[#d8dee4]" : ""}`}
              >
                <span className="text-[12px] font-semibold font-mono text-[#24292f]">
                  {p.machine_id}
                </span>
                <span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px]
                      font-semibold px-2 py-0.5 rounded-full border
                      ${RISK_BADGE[p.risk_level] || RISK_BADGE.Unknown}`}
                  >
                    {p.risk_level || "—"}
                  </span>
                </span>
                <span
                  className={`text-[12px] font-semibold tabular-nums
                    ${
                      p.probability > 0.6
                        ? "text-[#cf222e]"
                        : p.probability > 0.3
                          ? "text-[#9a6700]"
                          : "text-[#1a7f37]"
                    }`}
                >
                  {p.probability != null ? (
                    `${(p.probability * 100).toFixed(1)}%`
                  ) : (
                    <span className="text-[#6e7781] font-normal">—</span>
                  )}
                </span>
                <span className="text-[11px] text-[#57606a]">
                  {p.timestamp
                    ? new Date(p.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;