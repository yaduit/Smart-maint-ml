import { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout.jsx";
import Icon from "../components/Icon.jsx";
import { getAllMachines } from "../services/api.js";

const RISK_BADGE = {
  High: "bg-[#ffebe9] text-[#cf222e] border-[#ffc1c0]",
  Medium: "bg-[#fff8c5] text-[#9a6700] border-[#d4a72c]",
  Low: "bg-[#dafbe1] text-[#1a7f37] border-[#82e79a]",
  Unknown: "bg-[#f6f8fa] text-[#6e7781] border-[#d0d7de]",
};

const DOT = {
  High: "bg-[#cf222e]",
  Medium: "bg-[#9a6700]",
  Low: "bg-[#1a7f37]",
  Unknown: "bg-[#d0d7de]",
};

const COLUMNS = [
  { key: "machine_id", label: "Machine ID" },
  { key: "air_temp", label: "Air Temp (K)" },
  { key: "process_temp", label: "Process Temp (K)" },
  { key: "rpm", label: "RPM" },
  { key: "torque", label: "Torque (Nm)" },
  { key: "tool_wear", label: "Tool Wear (min)" },
  { key: "risk_level", label: "Risk Level" },
  { key: "probability", label: "Probability" },
];

const PER_PAGE = 30;

const Machines = () => {
  const [allMachines, setAllMachines] = useState([]); // full dataset
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sort, setSort] = useState({ key: "machine_id", dir: "asc" });
  const [page, setPage] = useState(1);

  // Load ALL machines once — client handles filter/sort/paginate
  useEffect(() => {
    getAllMachines()
      .then((res) => {
        const data = res.data?.machines || res.data || [];
        setAllMachines(data);
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = useCallback((key) => {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }, []);

  // Reset page when filter/search changes
  const handleQuery = useCallback((e) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);
  const handleRiskFilter = useCallback((val) => {
    setRiskFilter(val);
    setPage(1);
  }, []);

  // Counts from full dataset
  const counts = useMemo(
    () => ({
      high: allMachines.filter((m) => m.risk_level === "High").length,
      medium: allMachines.filter((m) => m.risk_level === "Medium").length,
      low: allMachines.filter((m) => m.risk_level === "Low").length,
    }),
    [allMachines],
  );

  // Filter + sort across full dataset
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMachines
      .filter((m) => {
        const matchQ = !q || m.machine_id?.toLowerCase().includes(q);
        const matchR = riskFilter === "All" || m.risk_level === riskFilter;
        return matchQ && matchR;
      })
      .sort((a, b) => {
        const av = a[sort.key] ?? "";
        const bv = b[sort.key] ?? "";
        const d = sort.dir === "asc" ? 1 : -1;
        return typeof av === "string"
          ? av.localeCompare(bv) * d
          : (av - bv) * d;
      });
  }, [allMachines, query, riskFilter, sort]);

  // Paginate filtered results
  const totalPages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageRows = filtered.slice(start, start + PER_PAGE);

  return (
    <Layout>
      {/* Heading */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-[#24292f] tracking-tight">
            Machines
          </h1>
          <p className="text-[12px] text-[#57606a] mt-0.5">
            {allMachines.length} monitored ·&nbsp;
            <span className="text-[#cf222e]">{counts.high} high</span> ·&nbsp;
            <span className="text-[#9a6700]">{counts.medium} medium</span>{" "}
            ·&nbsp;
            <span className="text-[#1a7f37]">{counts.low} healthy</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Icon
            name="search"
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6e7781]"
          />
          <input
            value={query}
            onChange={handleQuery}
            placeholder="Filter by machine ID…"
            className="pl-8 pr-3 py-1.5 text-[12px] bg-white border border-[#d0d7de]
                       rounded-md outline-none placeholder:text-[#6e7781] text-[#24292f]
                       w-56 focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/20"
          />
        </div>

        <div className="flex border border-[#d0d7de] rounded-md overflow-hidden bg-white">
          {["All", "High", "Medium", "Low"].map((r) => (
            <button
              key={r}
              onClick={() => handleRiskFilter(r)}
              className={`px-3 py-1.5 text-[12px] font-medium border-r last:border-r-0
                border-[#d0d7de] transition-colors cursor-pointer bg-transparent
                ${
                  riskFilter === r
                    ? "bg-[#0969da] text-white"
                    : "text-[#57606a] hover:bg-[#f6f8fa]"
                }`}
            >
              {r}
              {r !== "All" && (
                <span className="ml-1 text-[11px] opacity-75">
                  {counts[r.toLowerCase()]}
                </span>
              )}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-[#6e7781] ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f6f8fa] border-b border-[#d0d7de]">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold
                               uppercase tracking-wider text-[#57606a]
                               whitespace-nowrap cursor-pointer
                               hover:text-[#24292f] select-none"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sort.key === col.key && (
                        <span className="text-[#0969da]">
                          {sort.dir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#d8dee4]">
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="px-4 py-3">
                        <div className="h-3 bg-[#eaeef2] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="py-14 text-center text-[#6e7781]"
                  >
                    <Icon
                      name="search"
                      size={20}
                      className="mx-auto mb-2 opacity-40"
                    />
                    <p className="text-[12px]">No machines match your filter</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((m, i) => (
                  <tr
                    key={m.machine_id}
                    className={`hover:bg-[#f6f8fa] transition-colors
                    ${i < pageRows.length - 1 ? "border-b border-[#d8dee4]" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0
                        ${DOT[m.risk_level] || DOT.Unknown}`}
                        />
                        <span className="text-[12px] font-semibold font-mono text-[#24292f]">
                          {m.machine_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#57606a] tabular-nums">
                      {m.air_temp?.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#57606a] tabular-nums">
                      {m.process_temp?.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#57606a] tabular-nums">
                      {m.rpm?.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#57606a] tabular-nums">
                      {m.torque?.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#57606a] tabular-nums">
                      {m.tool_wear?.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px]
                      font-semibold px-2 py-0.5 rounded-full border
                      ${RISK_BADGE[m.risk_level] || RISK_BADGE.Unknown}`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full
                        ${DOT[m.risk_level] || DOT.Unknown}`}
                        />
                        {m.risk_level || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[12px] font-semibold tabular-nums
                      ${
                        m.probability > 0.6
                          ? "text-[#cf222e]"
                          : m.probability > 0.3
                            ? "text-[#9a6700]"
                            : "text-[#1a7f37]"
                      }`}
                      >
                        {m.probability != null ? (
                          `${(m.probability * 100).toFixed(1)}%`
                        ) : (
                          <span className="text-[#6e7781] font-normal">—</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        {!loading && filtered.length > 0 && (
          <div
            className="px-4 py-3 border-t border-[#d0d7de] bg-[#f6f8fa]
                          flex items-center justify-between flex-wrap gap-2"
          >
            <span className="text-[11px] text-[#6e7781]">
              {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={safePage === 1}
                className="px-3 py-1 text-[11px] font-semibold border border-[#d0d7de]
                           rounded-md bg-white text-[#24292f] hover:bg-[#f6f8fa]
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Prev
              </button>
              <span className="text-[11px] text-[#57606a] px-1">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
                className="px-3 py-1 text-[11px] font-semibold border border-[#d0d7de]
                           rounded-md bg-white text-[#24292f] hover:bg-[#f6f8fa]
                           disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Machines;
