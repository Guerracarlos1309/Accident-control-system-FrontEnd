import {
  AlertCircle,
  FileCheck,
  Users,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  Building,
  Loader2,
  Car,
  Award,
  Layers,
  Heart,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  PieChart,
  Target,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = typeof dateStr === "string" ? dateStr.split("T")[0] : "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return new Date(cleanStr + "T00:00:00");
  }
  return new Date(dateStr);
};

// ─── Shared Mini-components ───────────────────────────────────────────────────

function HorizontalBar({ label, value, max, color = "#3b82f6" }) {
  const width = max > 0 ? ((value / max) * 100).toFixed(1) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-txt-main">
        <span className="truncate max-w-[180px]" title={label}>{label}</span>
        <span className="text-txt-muted ml-2 shrink-0">{value}</span>
      </div>
      <div className="h-2 w-full bg-bg-main/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

function DonutRing({ segments, size = 110, stroke = 18 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-bg-main/30" />
      {total === 0 ? null : segments.map((seg, i) => {
        const segLen = (seg.value / total) * circumference;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none" stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${segLen} ${circumference - segLen}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1s ease" }}
            strokeLinecap="round"
          />
        );
        offset += segLen;
        return el;
      })}
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="15" fontWeight="900" fill="currentColor" className="text-txt-main">
        {total}
      </text>
    </svg>
  );
}

function MiniBarChart({ data, color = "#e30613" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * 100, 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group" title={`${d.label}: ${d.value}`}>
            <span className="text-[7px] font-black text-txt-muted/60 transition-colors group-hover:text-txt-main">{d.value > 0 ? d.value : ""}</span>
            <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${h}%`, background: d.value > 0 ? color : "rgba(255,255,255,0.05)", border: `1px solid ${d.value > 0 ? color + "60" : "rgba(255,255,255,0.08)"}` }} />
            <span className="text-[6px] font-black text-txt-muted uppercase">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatMiniCard({ icon: Icon, label, value, color = "blue", sub, loading }) {
  const colors = {
    blue:   { bg: "bg-corpoelec-blue/10", text: "text-corpoelec-blue", border: "hover:border-corpoelec-blue/30" },
    red:    { bg: "bg-corpoelec-red/10",  text: "text-corpoelec-red",  border: "hover:border-corpoelec-red/30"  },
    green:  { bg: "bg-emerald-500/10",    text: "text-emerald-500",    border: "hover:border-emerald-500/30"    },
    amber:  { bg: "bg-amber-500/10",      text: "text-amber-500",      border: "hover:border-amber-500/30"      },
    purple: { bg: "bg-purple-500/10",     text: "text-purple-500",     border: "hover:border-purple-500/30"     },
    cyan:   { bg: "bg-cyan-500/10",       text: "text-cyan-500",       border: "hover:border-cyan-500/30"       },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`glass-panel p-5 rounded-[1.5rem] border border-border-main/50 ${c.border} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}><Icon size={18} /></div>
      </div>
      <p className="text-[8px] font-black text-txt-muted uppercase tracking-[0.2em] mb-1">{label}</p>
      {loading ? <Loader2 size={16} className="animate-spin text-txt-muted/30 mt-1" /> : (
        <h3 className={`text-2xl font-black ${c.text} tracking-tighter tabular-nums`}>{value}</h3>
      )}
      {sub && <p className="text-[8px] text-txt-muted mt-0.5 font-medium">{sub}</p>}
    </div>
  );
}

function SectionDivider({ label, color = "text-corpoelec-blue", borderColor = "from-corpoelec-blue/50" }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-px flex-1 bg-gradient-to-r ${borderColor} to-transparent`} />
      <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${color} px-3 py-1 bg-bg-main/50 rounded-full border border-border-main/40`}>
        {label}
      </span>
      <div className={`h-px flex-1 bg-gradient-to-l ${borderColor} to-transparent`} />
    </div>
  );
}

const CHART_COLORS = [
  "#e30613","#f97316","#f59e0b","#10b981",
  "#3b82f6","#8b5cf6","#ec4899","#06b6d4",
];

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const api = helpFetch();
  const { showNotification } = useNotification();

  // ── View mode ──
  const [dashView, setDashView] = useState("resumen"); // "resumen" | "estadisticas"

  // ── Data ──
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("all");

  const [rawAccidents, setRawAccidents] = useState([]);
  const [rawInspections, setRawInspections] = useState([]);
  const [rawEmployees, setRawEmployees] = useState([]);
  const [rawVehicles, setRawVehicles] = useState([]);
  const [rawFacilitiesCount, setRawFacilitiesCount] = useState(0);

  const [counts, setCounts] = useState({
    facilities: 0, employees: 0, accidents: 0,
    inspectionsTotal: 0, extinguishersInsps: 0, protectionInsps: 0, vehiclesInsps: 0,
  });

  const [monthlyAccidents, setMonthlyAccidents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    statusPending: 0, statusInProcess: 0, statusCompleted: 0,
    topTypes: [], topFacilities: [],
  });

  const [activeTab, setActiveTab] = useState("types");

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [accRes, empRes, facRes, insRes, periodRes, vehRes] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          api.get("/facilities"),
          api.get("/inspections"),
          api.get("/lookups/periods"),
          api.get("/vehicles"),
        ]);

        const accidentsList    = Array.isArray(accRes)    ? accRes    : [];
        const employeesList    = Array.isArray(empRes)    ? empRes    : [];
        const facilitiesList   = Array.isArray(facRes)    ? facRes    : [];
        const inspectionsList  = Array.isArray(insRes)    ? insRes    : [];
        const periodsList      = Array.isArray(periodRes) ? periodRes : [];
        const vehiclesList     = Array.isArray(vehRes)    ? vehRes    : [];

        const sortedPeriods = [...periodsList].sort(
          (a, b) => parseInt(b.annuality) - parseInt(a.annuality),
        );

        setRawAccidents(accidentsList);
        setRawInspections(inspectionsList);
        setRawEmployees(employeesList);
        setRawVehicles(vehiclesList);
        setRawFacilitiesCount(facilitiesList.length);
        setPeriods(sortedPeriods);

        const currentYear = new Date().getFullYear();
        const currentPeriod = sortedPeriods.find(
          (p) => parseInt(p.annuality) === currentYear,
        );
        if (currentPeriod) {
          setSelectedPeriodId(currentPeriod.id.toString());
        } else if (sortedPeriods.length > 0) {
          setSelectedPeriodId(sortedPeriods[0].id.toString());
        } else {
          setSelectedPeriodId("all");
        }
      } catch (err) {
        showNotification("Error al cargar indicadores del Dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ─── Derived data for Resumen view ───────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const selectedPeriod = periods.find(
      (p) => p.id.toString() === selectedPeriodId.toString(),
    );
    const selectedYear = selectedPeriod ? parseInt(selectedPeriod.annuality) : null;

    const filteredAccidents = rawAccidents.filter((acc) => {
      if (selectedPeriodId === "all") return true;
      if (acc.periodId && Number(acc.periodId) === Number(selectedPeriodId)) return true;
      if (acc.period?.id && Number(acc.period.id) === Number(selectedPeriodId)) return true;
      const dateStr = acc.date || acc.accidentDate;
      if (dateStr && selectedYear) {
        const d = parseLocalDate(dateStr);
        return d && d.getFullYear() === selectedYear;
      }
      return false;
    });

    const filteredInspections = rawInspections.filter((insp) => {
      if (selectedPeriodId === "all") return true;
      if (!selectedYear) return true;
      const dateStr = insp.date;
      if (dateStr) {
        const d = parseLocalDate(dateStr);
        return d && d.getFullYear() === selectedYear;
      }
      return false;
    });

    const extList  = filteredInspections.filter(i => i.type === "Extintor"   || i.extinguisherInspection);
    const protList = filteredInspections.filter(i => i.type === "Proteccion" || i.protectionInspection);
    const vehList  = filteredInspections.filter(i => i.type === "Vehiculo"   || i.vehicleInspection);

    setCounts({
      facilities: rawFacilitiesCount,
      employees: rawEmployees.length,
      accidents: filteredAccidents.length,
      inspectionsTotal: filteredInspections.length,
      extinguishersInsps: extList.length,
      protectionInsps: protList.length,
      vehiclesInsps: vehList.length,
    });

    const months = MONTH_NAMES;
    const chartData = [];
    if (selectedPeriodId === "all") {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mName = months[d.getMonth()];
        const mYear = d.getFullYear().toString().substring(2);
        const count = filteredAccidents.filter((acc) => {
          if (!acc.date && !acc.accidentDate) return false;
          const dateStr = acc.date || acc.accidentDate;
          const accDate = parseLocalDate(dateStr);
          return accDate && accDate.getMonth() === d.getMonth() && accDate.getFullYear() === d.getFullYear();
        }).length;
        chartData.push({ label: `${mName} '${mYear}`, count });
      }
    } else if (selectedYear) {
      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const count = filteredAccidents.filter((acc) => {
          if (!acc.date && !acc.accidentDate) return false;
          const dateStr = acc.date || acc.accidentDate;
          const accDate = parseLocalDate(dateStr);
          return accDate && accDate.getMonth() === monthIdx && accDate.getFullYear() === selectedYear;
        }).length;
        chartData.push({ label: months[monthIdx], count });
      }
    }
    setMonthlyAccidents(chartData);

    const statusPending   = filteredAccidents.filter(a => a.processStatusId === 1 || !a.processStatusId).length;
    const statusInProcess = filteredAccidents.filter(a => a.processStatusId === 2).length;
    const statusCompleted = filteredAccidents.filter(a => a.processStatusId === 3).length;

    const typesMap = {};
    filteredAccidents.forEach((a) => {
      const typeName = a.type?.name || "No clasificado";
      typesMap[typeName] = (typesMap[typeName] || 0) + 1;
    });
    const topTypes = Object.entries(typesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 4);

    const facsMap = {};
    filteredAccidents.forEach((a) => {
      const facName = a.facility?.name || "Extramuros / Externa";
      facsMap[facName] = (facsMap[facName] || 0) + 1;
    });
    const topFacilities = Object.entries(facsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 4);

    setStats({ statusPending, statusInProcess, statusCompleted, topTypes, topFacilities });

    const combinedEvents = [];
    filteredAccidents.forEach((acc) => {
      const name = acc.involvedEmployees?.[0]?.employee
        ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
        : "PERSONAL";
      const dateVal = acc.date || acc.accidentDate;
      combinedEvents.push({
        id: `acc-${acc.id}`,
        type: "accident",
        title: `Accidente: ${name}`,
        ref: acc.facility?.name || "INSTALACIÓN",
        time: dateVal ? parseLocalDate(dateVal).toLocaleDateString("es-VE", { day: "2-digit", month: "short" }) : "RECIENTE",
        path: "/accidents/register",
        rawDate: dateVal ? parseLocalDate(dateVal) : new Date(0),
      });
    });
    filteredInspections.forEach((ins) => {
      let typeLabel = "Auditoría ASHO";
      let path = "/inspections/extinguishers";
      if (ins.type === "Extintor"   || ins.extinguisherInspection) { typeLabel = "Inspecc. Extintor";  path = "/inspections/extinguishers"; }
      else if (ins.type === "Proteccion" || ins.protectionInspection)  { typeLabel = "Inspecc. EPP/EPC";   path = "/protection/inspections"; }
      else if (ins.type === "Vehiculo"   || ins.vehicleInspection)     { typeLabel = "Inspecc. Vehículo";  path = "/inspections/vehicles"; }
      combinedEvents.push({
        id: `ins-${ins.id}`,
        type: "inspection",
        title: `${typeLabel} #${ins.inspectionNumber || ins.id}`,
        ref: ins.facility?.name || "SEDE",
        time: ins.date ? parseLocalDate(ins.date).toLocaleDateString("es-VE", { day: "2-digit", month: "short" }) : "RECIENTE",
        path,
        rawDate: ins.date ? parseLocalDate(ins.date) : new Date(0),
      });
    });
    const sorted = combinedEvents.sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
    setRecentActivity(sorted);
  }, [selectedPeriodId, rawAccidents, rawInspections, rawEmployees, periods, loading]);

  // ─── Computed statistics for Estadísticas view ───────────────────────────
  const statsView = useMemo(() => {
    const fPeriod = periods.find(p => p.id.toString() === selectedPeriodId);
    const fYear   = fPeriod ? parseInt(fPeriod.annuality) : null;

    const fAcc = rawAccidents.filter(a => {
      if (selectedPeriodId === "all") return true;
      const d = parseLocalDate(a.accidentDate || a.date);
      return d && fYear && d.getFullYear() === fYear;
    });
    const fInsp = rawInspections.filter(i => {
      if (selectedPeriodId === "all") return true;
      const d = parseLocalDate(i.date);
      return d && fYear && d.getFullYear() === fYear;
    });

    const count = (arr, keyFn) => {
      const map = {};
      arr.forEach(item => { const k = keyFn(item); map[k] = (map[k] || 0) + 1; });
      return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };

    const monthly12 = MONTH_NAMES.map((label, idx) => {
      const yr = fYear || new Date().getFullYear();
      const value = fAcc.filter(a => {
        const d = parseLocalDate(a.accidentDate || a.date);
        return d && d.getMonth() === idx && d.getFullYear() === yr;
      }).length;
      return { label, value };
    });

    const inspMonthly = MONTH_NAMES.map((label, idx) => {
      const yr = fYear || new Date().getFullYear();
      const value = fInsp.filter(i => {
        const d = parseLocalDate(i.date);
        return d && d.getMonth() === idx && d.getFullYear() === yr;
      }).length;
      return { label, value };
    });

    const byYearArr = (() => {
      const map = {};
      rawAccidents.forEach(a => {
        const d = parseLocalDate(a.accidentDate || a.date);
        if (d) { const yr = d.getFullYear().toString(); map[yr] = (map[yr] || 0) + 1; }
      });
      return Object.entries(map).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([l, v]) => ({ label: l, value: v }));
    })();

    const allInvolved  = fAcc.flatMap(a => a.involvedEmployees || []);
    const totalRestDays = allInvolved.reduce((s, e) => s + (parseInt(e.restDays) || 0), 0);
    const totalEmp     = rawEmployees.length;
    const totalAcc     = fAcc.length;
    const totalVeh     = rawVehicles.length;
    const extL  = fInsp.filter(i => i.type === "Extintor"   || i.extinguisherInspection);
    const protL = fInsp.filter(i => i.type === "Proteccion" || i.protectionInspection);
    const vehL  = fInsp.filter(i => i.type === "Vehiculo"   || i.vehicleInspection);

    return {
      totalAcc, totalEmp, totalVeh,
      totalInvolved: allInvolved.length,
      totalRestDays,
      frecuencyIndex: totalEmp > 0 ? ((totalAcc / totalEmp) * 1000).toFixed(2) : "—",
      severityIndex:  totalEmp > 0 ? ((totalRestDays / totalEmp) * 1000).toFixed(2) : "—",
      accRate:        totalEmp > 0 ? ((totalAcc / totalEmp) * 100).toFixed(1) : "0.0",
      statusPending:   fAcc.filter(a => a.processStatusId === 1 || !a.processStatusId).length,
      statusInProcess: fAcc.filter(a => a.processStatusId === 2).length,
      statusCompleted: fAcc.filter(a => a.processStatusId === 3).length,
      monthly12, byYearArr, inspMonthly,
      byType:       count(fAcc,  a => a.type?.name || "Sin clasificar"),
      byMagnitude:  count(fAcc,  a => a.magnitude?.name || "Sin magnitud"),
      byFacility:   count(fAcc,  a => a.facility?.name || "Extramuros"),
      byManagement: count(fAcc,  a => a.management?.name || "Sin gerencia"),
      byAgent:      count(fAcc,  a => a.damageAgent?.name || "Sin agente"),
      byContact:    count(fAcc,  a => a.contactType?.name || "Sin tipo"),
      byInjury:     count(allInvolved, e => e.injuryType?.name || "Sin tipo"),
      empByMgmt:    count(rawEmployees, e => e.management?.name || "Sin gerencia"),
      empByJob:     count(rawEmployees, e => e.jobTitle?.name || "Sin cargo").slice(0, 8),
      vehByType:    count(rawVehicles,  v => v.type?.name || "Sin tipo"),
      vehByBrand:   count(rawVehicles,  v => v.model?.brand?.name || "Sin marca"),
      inspByFac:    count(fInsp,        i => i.facility?.name || "Sin sede"),
      extL, protL, vehL,
    };
  }, [rawAccidents, rawInspections, rawEmployees, rawVehicles, periods, selectedPeriodId]);

  const maxAccidentCount     = Math.max(...monthlyAccidents.map(m => m.count), 1);
  const totalInvolvedStats   = stats.statusPending + stats.statusInProcess + stats.statusCompleted;

  const donutAccStatus = [
    { label: "Pendiente",   value: statsView.statusPending,   color: "#f59e0b" },
    { label: "En Proceso",  value: statsView.statusInProcess, color: "#3b82f6" },
    { label: "Completado",  value: statsView.statusCompleted, color: "#10b981" },
  ];
  const donutInspTypes = [
    { label: "Extintores", value: statsView.extL?.length || 0, color: "#10b981" },
    { label: "EPP/EPC",    value: statsView.protL?.length || 0, color: "#3b82f6" },
    { label: "Vehículos",  value: statsView.vehL?.length || 0,  color: "#a855f7" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-txt-main">

      {/* ── HEADER con tabs ────────────────────────────────────────────────── */}
      <div className="relative group select-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-corpoelec-blue to-emerald-600 rounded-[2rem] blur opacity-10 group-hover:opacity-15 transition duration-1000" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-bg-surface backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-border-main/50">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
              {dashView === "resumen" ? "Resumen de Gestión" : "Centro de Estadísticas"}
            </h2>
            <p className="text-txt-muted max-w-xl text-xs leading-relaxed">
              {dashView === "resumen"
                ? <>Panel de control ASHO. Indicadores en <span className="text-emerald-500 font-black uppercase">tiempo real</span>.</>
                : <>Análisis integral — <span className="text-corpoelec-blue font-black">accidentabilidad, inspecciones, talento humano y flota</span>.</>
              }
            </p>

            {/* Tabs */}
            <div className="flex bg-bg-main/40 p-1 rounded-xl border border-border-main/50 w-fit">
              <button
                onClick={() => setDashView("resumen")}
                className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all ${
                  dashView === "resumen"
                    ? "bg-bg-surface text-corpoelec-blue shadow border border-border-main/50"
                    : "text-txt-muted hover:text-txt-main"
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setDashView("estadisticas")}
                className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  dashView === "estadisticas"
                    ? "bg-bg-surface text-corpoelec-blue shadow border border-border-main/50"
                    : "text-txt-muted hover:text-txt-main"
                }`}
              >
                <BarChart3 size={11} />
                Estadísticas
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 self-stretch md:self-auto">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest block">Año / Período</span>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-bg-main/80 border border-border-main/60 hover:border-corpoelec-blue/50 text-xs font-bold text-txt-main rounded-2xl px-4 py-3 outline-none focus:border-corpoelec-blue focus:ring-1 focus:ring-corpoelec-blue transition-all cursor-pointer min-w-[160px]"
              >
                <option value="all">Ver Todos</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id.toString()}>Gestión {p.annuality}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 bg-bg-main/40 px-5 py-3.5 rounded-2xl border border-border-main/60 justify-center">
              <div className="text-left">
                <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest block">Última Sincronización</span>
                <span className="text-xs font-bold text-txt-main">
                  {new Date().toLocaleDateString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: RESUMEN
      ══════════════════════════════════════════════════════════════════════ */}
      {dashView === "resumen" && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-black tracking-tighter">
            <div onClick={() => navigate("/infra/facilities")}
              className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-corpoelec-blue/30 transition-all hover:shadow-xl cursor-pointer hover:scale-[1.02] duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-corpoelec-blue/10 text-corpoelec-blue group-hover:scale-110 transition-transform"><Building size={26} /></div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">Sedes</div>
              </div>
              <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">Instalaciones Activas</p>
              {loading ? <Loader2 size={20} className="animate-spin text-txt-muted/30 mt-2" /> : (
                <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">{counts.facilities}</h3>
              )}
            </div>

            <div onClick={() => navigate("/hr/employees")}
              className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-emerald-500/30 transition-all hover:shadow-xl cursor-pointer hover:scale-[1.02] duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform"><Users size={26} /></div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">RRHH</div>
              </div>
              <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">Personal Registrado</p>
              {loading ? <Loader2 size={20} className="animate-spin text-txt-muted/30 mt-2" /> : (
                <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">{counts.employees}</h3>
              )}
            </div>

            <div onClick={() => navigate("/inspections/extinguishers")}
              className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-amber-500/30 transition-all hover:shadow-xl cursor-pointer hover:scale-[1.02] duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform"><FileCheck size={26} /></div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">ASHO</div>
              </div>
              <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">Inspecciones Realizadas</p>
              {loading ? <Loader2 size={20} className="animate-spin text-txt-muted/30 mt-2" /> : (
                <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">{counts.inspectionsTotal}</h3>
              )}
            </div>

            <div onClick={() => navigate("/accidents/register")}
              className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-corpoelec-red/30 transition-all hover:shadow-xl cursor-pointer hover:scale-[1.02] duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-corpoelec-red/10 text-corpoelec-red group-hover:scale-110 transition-transform"><AlertCircle size={26} /></div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">Seguridad</div>
              </div>
              <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">Accidentes Reportados</p>
              {loading ? <Loader2 size={20} className="animate-spin text-txt-muted/30 mt-2" /> : (
                <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">{counts.accidents}</h3>
              )}
            </div>
          </div>

          {/* Chart & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Historial chart */}
              <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10 relative z-10 select-none">
                  <div className="space-y-1">
                    <h4 className="text-lg md:text-xl font-black text-txt-main uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp size={20} className="text-corpoelec-red" />Historial de Accidentes
                    </h4>
                    <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      {selectedPeriodId === "all" ? "Últimos 6 meses" : "Distribución mensual del año seleccionado"}
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-bg-main/5 text-[9px] font-black uppercase text-txt-muted border border-border-main/50">
                    {selectedPeriodId === "all" ? "Línea de Tiempo" : "Vista Anual"}
                  </div>
                </div>
                {loading ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-corpoelec-blue" /></div>
                ) : (
                  <div className="h-64 flex items-end justify-between gap-4 px-4 relative z-10">
                    {monthlyAccidents.map((m, idx) => {
                      const percentage = maxAccidentCount > 0 ? (m.count / maxAccidentCount) * 80 + 10 : 10;
                      return (
                        <div key={idx} className="group flex-1 h-full flex flex-col justify-end items-center">
                          <div className="text-[10px] font-black text-corpoelec-red mb-1.5 transition-transform duration-300 group-hover:scale-110">{m.count}</div>
                          <div className="w-full h-44 flex items-end relative">
                            <div
                              className={`w-full rounded-t-xl transition-all duration-700 cursor-pointer ${m.count > 0 ? "bg-gradient-to-t from-corpoelec-red/50 to-corpoelec-red border border-corpoelec-red/60 hover:brightness-110 hover:shadow-[0_0_15px_rgba(227,6,19,0.35)]" : "bg-bg-main/20 border border-border-main/60 hover:border-corpoelec-blue/30"}`}
                              style={{ height: `${percentage}%` }}
                              title={`${m.count} Accidentes`}
                            />
                          </div>
                          <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest mt-2">{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Breakdown panel */}
              <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 select-none">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="space-y-1">
                    <h4 className="text-md font-black text-txt-main uppercase tracking-tight">Distribución Analítica de Accidentes</h4>
                    <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest">Análisis cruzado por estado y tipos</p>
                  </div>
                  <div className="flex bg-bg-main/40 p-1 rounded-xl border border-border-main/60 w-full sm:w-auto">
                    <button onClick={() => setActiveTab("types")} className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === "types" ? "bg-bg-surface text-corpoelec-blue shadow-sm border border-border-main/50" : "text-txt-muted hover:text-txt-main"}`}>Tipos de Suceso</button>
                    <button onClick={() => setActiveTab("facilities")} className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === "facilities" ? "bg-bg-surface text-corpoelec-blue shadow-sm border border-border-main/50" : "text-txt-muted hover:text-txt-main"}`}>Por Instalación</button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-corpoelec-blue" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 space-y-4 bg-bg-main/20 p-6 rounded-3xl border border-border-main/40">
                      <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest block mb-1">FLUJO DE INVESTIGACIONES</span>
                      {[
                        { label: "Pendientes", val: stats.statusPending, color: "bg-amber-500" },
                        { label: "En Proceso", val: stats.statusInProcess, color: "bg-corpoelec-blue" },
                        { label: "Completados", val: stats.statusCompleted, color: "bg-green-500" },
                      ].map((s, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black text-txt-main uppercase">
                            <span>{s.label}</span>
                            <span>{s.val}</span>
                          </div>
                          <div className="h-2 w-full bg-bg-main/40 rounded-full overflow-hidden">
                            <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${totalInvolvedStats > 0 ? (s.val / totalInvolvedStats) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      {activeTab === "types" ? (
                        stats.topTypes.length === 0 ? (
                          <p className="text-xs text-txt-muted italic py-6">Sin registros categorizados.</p>
                        ) : stats.topTypes.map((t, index) => {
                          const totalTypesCount = Math.max(...stats.topTypes.map(x => x.count), 1);
                          return (
                            <div key={index} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold text-txt-main uppercase">
                                <span className="truncate max-w-[220px]">{t.name}</span>
                                <span className="text-txt-muted text-[10px]">{t.count} Accidentes</span>
                              </div>
                              <div className="h-2.5 w-full bg-bg-main/30 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-corpoelec-red to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${(t.count / totalTypesCount) * 100}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : stats.topFacilities.length === 0 ? (
                        <p className="text-xs text-txt-muted italic py-6">Sin registros por sedes.</p>
                      ) : stats.topFacilities.map((f, index) => {
                        const totalFacsCount = Math.max(...stats.topFacilities.map(x => x.count), 1);
                        return (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-txt-main uppercase">
                              <span className="truncate max-w-[220px]">{f.name}</span>
                              <span className="text-txt-muted text-[10px]">{f.count} casos</span>
                            </div>
                            <div className="h-2.5 w-full bg-bg-main/30 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-corpoelec-blue to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(f.count / totalFacsCount) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Inspection split */}
              <div className="glass-panel rounded-[2rem] p-6 md:p-8 border border-border-main/50 select-none">
                <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-5">Desglose de Inspecciones de Seguridad</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold uppercase tracking-wider">
                  <div onClick={() => navigate("/inspections/extinguishers")} className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03]">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-emerald-500 tracking-widest block">EXTINTORES</span>
                      <span className="text-xl font-black text-txt-main">{counts.extinguishersInsps}</span>
                    </div>
                    <ShieldCheck size={20} className="text-emerald-500" />
                  </div>
                  <div onClick={() => navigate("/protection/inspections")} className="bg-corpoelec-blue/5 hover:bg-corpoelec-blue/10 border border-corpoelec-blue/20 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03]">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-corpoelec-blue tracking-widest block">EQUIPOS EPP/EPC</span>
                      <span className="text-xl font-black text-txt-main">{counts.protectionInsps}</span>
                    </div>
                    <Zap size={20} className="text-corpoelec-blue" />
                  </div>
                  <div onClick={() => navigate("/inspections/vehicles")} className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03]">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-purple-500 tracking-widest block">VEHICULARES</span>
                      <span className="text-xl font-black text-txt-main">{counts.vehiclesInsps}</span>
                    </div>
                    <Car size={20} className="text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 flex flex-col justify-between select-none">
              <div>
                <h4 className="text-xs font-black text-txt-main uppercase tracking-widest mb-8 pb-4 border-b border-border-main/50 flex items-center justify-between">
                  <span>Actividad Reciente</span>
                  <Award size={16} className="text-corpoelec-blue" />
                </h4>
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-2 text-txt-muted">
                    <Loader2 size={24} className="animate-spin text-corpoelec-blue" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Cargando bitácora...</span>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="py-20 text-center text-txt-muted text-xs italic">Sin movimientos recientes.</div>
                ) : (
                  <div className="space-y-6">
                    {recentActivity.map((act) => (
                      <div key={act.id} onClick={() => navigate(act.path)}
                        className="flex gap-4 group cursor-pointer p-2.5 rounded-2xl hover:bg-bg-main/10 border border-transparent hover:border-border-main/40 transition-all duration-300">
                        <div className={`w-1.5 h-10 rounded-full transition-all group-hover:w-2 shrink-0 ${act.type === "accident" ? "bg-corpoelec-red shadow-[0_0_10px_rgba(227,6,19,0.3)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"}`} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-txt-main uppercase truncate group-hover:text-corpoelec-blue transition-colors leading-tight" title={act.title}>{act.title}</p>
                            <ArrowUpRight size={14} className="text-txt-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                          </div>
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-txt-muted">
                            <span className="truncate max-w-[120px]">{act.ref}</span>
                            <span className="text-corpoelec-blue bg-corpoelec-blue/5 px-1.5 py-0.5 rounded border border-corpoelec-blue/10 ml-2">{act.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-6">
                <button onClick={() => navigate("/reports")} className="w-full py-4 text-[9px] font-black text-txt-muted hover:text-corpoelec-blue hover:border-corpoelec-blue/30 bg-bg-main/5 hover:bg-corpoelec-blue/5 rounded-2xl transition-all uppercase tracking-widest border border-border-main/30 cursor-pointer">
                  Ver Bitácora de Gestión
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA: ESTADÍSTICAS
      ══════════════════════════════════════════════════════════════════════ */}
      {dashView === "estadisticas" && (
        <div className="space-y-10">

          {/* KPI fila superior */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 select-none">
            <StatMiniCard icon={AlertCircle} label="Accidentes"        value={statsView.totalAcc}       color="red"    loading={loading} />
            <StatMiniCard icon={Users}       label="Empleados"         value={statsView.totalEmp}       color="green"  loading={loading} />
            <StatMiniCard icon={FileCheck}   label="Inspecciones"      value={rawInspections.length}    color="amber"  loading={loading} />
            <StatMiniCard icon={Car}         label="Vehículos"         value={statsView.totalVeh}       color="purple" loading={loading} />
            <StatMiniCard icon={Users}       label="Afectados"         value={statsView.totalInvolved}  color="cyan"   loading={loading} sub="en accidentes" />
          </div>

          {/* ── ACCIDENTES ───────────────────────────────────────────────── */}
          <SectionDivider label="Accidentabilidad" color="text-corpoelec-red" borderColor="from-corpoelec-red/40" />

          {/* Tendencia mensual */}
          <div className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
            <p className="text-[9px] font-black text-corpoelec-red uppercase tracking-widest mb-1">Tendencia Mensual</p>
            <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">Distribución de Accidentes por Mes</h4>
            {loading ? <div className="h-24 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-corpoelec-blue" /></div> : (
              <MiniBarChart data={statsView.monthly12} color="#e30613" />
            )}
          </div>

          {/* 3 columnas: Tipo, Magnitud, Instalación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Por Tipo de Suceso", data: statsView.byType,      color: "text-corpoelec-red" },
              { title: "Por Magnitud",       data: statsView.byMagnitude,  color: "text-amber-500"     },
              { title: "Por Instalación",    data: statsView.byFacility,   color: "text-corpoelec-blue"},
            ].map((section, si) => (
              <div key={si} className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${section.color}`}>Accidentes</p>
                <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">{section.title}</h4>
                {loading ? <Loader2 size={18} className="animate-spin text-txt-muted/30" /> : (
                  <div className="space-y-2.5">
                    {section.data.length === 0
                      ? <p className="text-xs text-txt-muted italic">Sin registros</p>
                      : section.data.slice(0, 6).map((t, i) => (
                          <HorizontalBar key={i} label={t.label} value={t.value} max={section.data[0]?.value || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gerencia + Historial anual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Accidentes</p>
              <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">Por Gerencia</h4>
              {loading ? <Loader2 size={18} className="animate-spin text-txt-muted/30" /> : (
                <div className="space-y-2.5">
                  {statsView.byManagement.length === 0
                    ? <p className="text-xs text-txt-muted italic">Sin registros</p>
                    : statsView.byManagement.slice(0, 8).map((t, i) => (
                        <HorizontalBar key={i} label={t.label} value={t.value} max={statsView.byManagement[0]?.value || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))
                  }
                </div>
              )}
            </div>

            <div className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
              <p className="text-[8px] font-black text-corpoelec-blue uppercase tracking-widest mb-1">Histórico</p>
              <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">Evolución Anual de Accidentes</h4>
              {loading ? <div className="h-24 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-corpoelec-blue" /></div> : (
                <MiniBarChart data={statsView.byYearArr} color="#3b82f6" />
              )}
            </div>
          </div>

          {/* ── INSPECCIONES ─────────────────────────────────────────────── */}
          <SectionDivider label="Inspecciones de Seguridad" color="text-emerald-500" borderColor="from-emerald-500/40" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Distribución</p>
              <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-4">Por Tipo de Inspección</h4>
              {loading ? <div className="h-24 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-corpoelec-blue" /></div> : (
                <div className="flex flex-col items-center gap-4">
                  <DonutRing segments={donutInspTypes} size={110} stroke={18} />
                  <div className="space-y-1.5 w-full">
                    {donutInspTypes.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] font-black uppercase">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          <span className="text-txt-muted">{s.label}</span>
                        </div>
                        <span style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 glass-panel rounded-[2rem] p-7 border border-border-main/50">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Actividad Mensual</p>
              <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">Inspecciones Realizadas por Mes</h4>
              {loading ? <div className="h-24 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-corpoelec-blue" /></div> : (
                <MiniBarChart data={statsView.inspMonthly} color="#10b981" />
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Cobertura</p>
            <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">Inspecciones por Instalación</h4>
            {loading ? <Loader2 size={18} className="animate-spin text-txt-muted/30" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {statsView.inspByFac.length === 0
                  ? <p className="text-xs text-txt-muted italic">Sin registros</p>
                  : statsView.inspByFac.slice(0, 9).map((t, i) => (
                      <HorizontalBar key={i} label={t.label} value={t.value} max={statsView.inspByFac[0]?.value || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))
                }
              </div>
            )}
          </div>

          {/* ── RRHH ─────────────────────────────────────────────────────── */}
          <SectionDivider label="Recursos Humanos" color="text-corpoelec-blue" borderColor="from-corpoelec-blue/40" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Personal por Gerencia", data: statsView.empByMgmt, color: "text-corpoelec-blue" },
              { title: "Personal por Cargo",    data: statsView.empByJob,  color: "text-purple-500"    },
            ].map((section, si) => (
              <div key={si} className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${section.color}`}>Empleados Activos</p>
                <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">{section.title}</h4>
                {loading ? <Loader2 size={18} className="animate-spin text-txt-muted/30" /> : (
                  <div className="space-y-2.5">
                    {section.data.length === 0
                      ? <p className="text-xs text-txt-muted italic">Sin registros</p>
                      : section.data.slice(0, 8).map((t, i) => (
                          <HorizontalBar key={i} label={t.label} value={t.value} max={section.data[0]?.value || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── FLOTA VEHICULAR ───────────────────────────────────────────── */}
          <SectionDivider label="Flota Vehicular" color="text-purple-500" borderColor="from-purple-500/40" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Vehículos por Tipo",  data: statsView.vehByType,  color: "text-purple-500" },
              { title: "Vehículos por Marca", data: statsView.vehByBrand, color: "text-cyan-500"   },
            ].map((section, si) => (
              <div key={si} className="glass-panel rounded-[2rem] p-7 border border-border-main/50">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${section.color}`}>Flota Registrada</p>
                <h4 className="text-sm font-black text-txt-main uppercase tracking-tight mb-5">{section.title}</h4>
                {loading ? <Loader2 size={18} className="animate-spin text-txt-muted/30" /> : (
                  <div className="space-y-2.5">
                    {section.data.length === 0
                      ? <p className="text-xs text-txt-muted italic">Sin registros</p>
                      : section.data.slice(0, 8).map((t, i) => (
                          <HorizontalBar key={i} label={t.label} value={t.value} max={section.data[0]?.value || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
