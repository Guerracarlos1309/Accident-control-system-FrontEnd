import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldAlert,
  FileText,
  Download,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  Loader2,
  X,
} from "lucide-react";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const formatLocalDate = (dateStr) => {
  if (!dateStr) return "-";
  const cleanStr = typeof dateStr === "string" ? dateStr.split("T")[0] : "";
  const parts = cleanStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${parseInt(day, 10)}/${parseInt(month, 10)}/${year}`;
  }
  return new Date(dateStr).toLocaleDateString();
};
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = typeof dateStr === "string" ? dateStr.split("T")[0] : "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return new Date(cleanStr + "T00:00:00");
  }
  return new Date(dateStr);
};

export default function ReportCenter() {
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("all");

  const [rawAccidents, setRawAccidents] = useState([]);
  const [rawInspections, setRawInspections] = useState([]);
  const [rawEmployeesCount, setRawEmployeesCount] = useState(0);
  const [rawUsersCount, setRawUsersCount] = useState(0);

  const [downloading, setDownloading] = useState({
    payroll: false,
    accidents: false,
    inspections: false,
  });
  const [stats, setStats] = useState({
    accidents: 0,
    employees: 0,
    users: 0,
    inspections: 0,
  });

  const [accidentDistribution, setAccidentDistribution] = useState([]);

  // Custom columns configuration state
  const [customMode, setCustomMode] = useState({
    payroll: false,
    accidents: false,
    inspections: false,
  });

  const [selectedCols, setSelectedCols] = useState({
    payroll: ["personalNumber", "idCard", "fullName", "management", "jobTitle"],
    accidents: [
      "accidentControlNumber",
      "accidentDate",
      "accidentType",
      "facility",
      "status",
    ],
    inspections: [
      "inspectionNumber",
      "date",
      "facility",
      "inspector",
      "typeStatus",
    ],
  });

  const [monthlyTrend, setMonthlyTrend] = useState(
    Array.from({ length: 12 }, (_, i) => ({
      monthIdx: i,
      accidents: 0,
      inspections: 0,
      total: 0,
    })),
  );

  const handleColChange = (type, colKey, checked) => {
    const list = selectedCols[type];
    if (checked) {
      if (list.length >= 7) {
        showNotification(
          "Puedes seleccionar un máximo de 7 columnas para garantizar la legibilidad en el PDF.",
          "warning",
        );
        return;
      }
      setSelectedCols((prev) => ({
        ...prev,
        [type]: [...prev[type], colKey],
      }));
    } else {
      setSelectedCols((prev) => ({
        ...prev,
        [type]: prev[type].filter((k) => k !== colKey),
      }));
    }
  };

  // Custom Dynamic Report generator state
  const [customReportType, setCustomReportType] = useState("accidents");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedManagement, setSelectedManagement] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [accidentTypeId, setAccidentTypeId] = useState("");
  const [processStatusId, setProcessStatusId] = useState("");
  const [inspectionType, setInspectionType] = useState("");
  const [inspectionStatusId, setInspectionStatusId] = useState("");

  // Lookups lists
  const [managements, setManagements] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [accidentTypes, setAccidentTypes] = useState([]);
  const [inspectionStatuses, setInspectionStatuses] = useState([]);

  // Preview records
  const [previewRecords, setPreviewRecords] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [customDownloading, setCustomDownloading] = useState(false);

  const api = helpFetch();
  const { showNotification, clearNotifications } = useNotification();
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrador";

  useEffect(() => {
    const fetchStatsAndLookups = async () => {
      setLoading(true);
      try {
        const [
          accRes,
          empRes,
          userRes,
          inspRes,
          mgtRes,
          facRes,
          accTypeRes,
          statusRes,
          periodRes,
        ] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          isAdmin ? api.get("/users") : Promise.resolve([]),
          api.get("/inspections"),
          api.get("/lookups/managements"),
          api.get("/facilities"),
          api.get("/lookups/accident-types"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/periods"),
        ]);

        const accidentsList = Array.isArray(accRes) ? accRes : [];
        const inspectionsList = Array.isArray(inspRes) ? inspRes : [];
        const periodsList = Array.isArray(periodRes) ? periodRes : [];

        const sortedPeriods = [...periodsList].sort(
          (a, b) => parseInt(b.annuality) - parseInt(a.annuality),
        );

        setRawAccidents(accidentsList);
        setRawInspections(inspectionsList);
        setRawEmployeesCount(Array.isArray(empRes) ? empRes.length : 0);
        setRawUsersCount(Array.isArray(userRes) ? userRes.length : 0);
        setPeriods(sortedPeriods);

        // Find the period representing the current year
        const currentYear = new Date().getFullYear();
        const currentPeriod = sortedPeriods.find(
          (p) => parseInt(p.annuality) === currentYear,
        );
        if (currentPeriod) {
          setSelectedPeriodId(currentPeriod.id.toString());
        } else if (sortedPeriods.length > 0) {
          // Default to latest period by annuality (already sorted first)
          setSelectedPeriodId(sortedPeriods[0].id.toString());
        } else {
          setSelectedPeriodId("all");
        }

        if (Array.isArray(mgtRes)) setManagements(mgtRes);
        if (Array.isArray(facRes)) setFacilities(facRes);
        if (Array.isArray(accTypeRes)) setAccidentTypes(accTypeRes);
        if (Array.isArray(statusRes)) setInspectionStatuses(statusRes);
      } catch (error) {
        console.error("Error loading stats and lookups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndLookups();
  }, []);

  useEffect(() => {
    if (loading) return;

    // 1. Find selected period / year
    const selectedPeriod = periods.find(
      (p) => p.id.toString() === selectedPeriodId.toString(),
    );
    const selectedYear = selectedPeriod ? parseInt(selectedPeriod.annuality) : null;

    // 2. Filter accidents by period
    const filteredAccidents = rawAccidents.filter((acc) => {
      if (selectedPeriodId === "all") return true;
      if (acc.periodId && Number(acc.periodId) === Number(selectedPeriodId))
        return true;
      if (acc.period?.id && Number(acc.period.id) === Number(selectedPeriodId))
        return true;

      const dateStr = acc.date || acc.accidentDate;
      if (dateStr && selectedYear) {
        const d = parseLocalDate(dateStr);
        return d && d.getFullYear() === selectedYear;
      }
      return false;
    });

    // 3. Filter inspections by period year
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

    // 4. Update general stats
    setStats({
      accidents: filteredAccidents.length,
      employees: rawEmployeesCount,
      users: rawUsersCount,
      inspections: filteredInspections.length,
    });

    // 5. Update accident distribution
    const typeColors = [
      "#005C9E",
      "#E30613",
      "#F59E0B",
      "#10B981",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
    ];
    const typeCounts = {};
    filteredAccidents.forEach((acc) => {
      const typeName = acc.type?.name || "Sin clasificar";
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });
    const total = filteredAccidents.length || 1;
    const distData = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        pct: Math.round((count / total) * 100),
        color: typeColors[idx % typeColors.length],
      }));
    setAccidentDistribution(distData);

    // 6. Update monthly trend
    // If a year is selected, show trend for that selected year.
    // If "all" is selected, default to current year.
    const trendYear = selectedYear || new Date().getFullYear();
    const trendData = Array.from({ length: 12 }, (_, monthIdx) => {
      const accCount = filteredAccidents.filter((acc) => {
        const dateStr = acc.date || acc.accidentDate;
        if (!dateStr) return false;
        const d = parseLocalDate(dateStr);
        return d && d.getFullYear() === trendYear && d.getMonth() === monthIdx;
      }).length;

      const inspCount = filteredInspections.filter((insp) => {
        if (!insp.date) return false;
        const d = parseLocalDate(insp.date);
        return d && d.getFullYear() === trendYear && d.getMonth() === monthIdx;
      }).length;

      return {
        monthIdx,
        accidents: accCount,
        inspections: inspCount,
        total: accCount + inspCount,
      };
    });
    setMonthlyTrend(trendData);
  }, [selectedPeriodId, rawAccidents, rawInspections, periods, loading]);

  const handleDownload = async (type, endpoint, defaultName) => {
    setDownloading((prev) => ({ ...prev, [type]: true }));
    try {
      showNotification("Generando y descargando PDF...", "info");
      let url = endpoint;
      if (customMode[type]) {
        const cols = selectedCols[type];
        if (cols.length === 0) {
          showNotification(
            "Selecciona al menos una columna para exportar",
            "warning",
          );
          setDownloading((prev) => ({ ...prev, [type]: false }));
          return;
        }
        url += `?columns=${cols.join(",")}`;
      }
      await api.download(url, defaultName);
      clearNotifications();
      showNotification("Reporte descargado con éxito", "success");
    } catch (error) {
      clearNotifications();
      showNotification("Error al generar el archivo PDF", "error");
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDownloadCustomReport = async () => {
    if (!previewRecords || previewRecords.length === 0) {
      showNotification(
        "No hay registros en la vista previa para exportar.",
        "warning",
      );
      return;
    }

    setCustomDownloading(true);
    try {
      showNotification("Generando reporte a tu medida...", "info");

      const idsParam = previewRecords.map((r) => r.id).join(",");
      let queryParams = `?reportType=${customReportType}&ids=${idsParam}`;

      if (customMode[customReportType]) {
        const cols = selectedCols[customReportType];
        if (cols.length === 0) {
          showNotification(
            "Selecciona al menos una columna para exportar",
            "warning",
          );
          setCustomDownloading(false);
          return;
        }
        queryParams += `&columns=${cols.join(",")}`;
      }

      const filename = `reporte_personalizado_${customReportType}_${new Date().toISOString().split("T")[0]}.pdf`;
      await api.download(`/reports/custom${queryParams}`, filename);
      clearNotifications();
      showNotification("Reporte personalizado descargado", "success");
    } catch (error) {
      clearNotifications();
      showNotification("Error al generar el reporte a medida", "error");
    } finally {
      setCustomDownloading(false);
    }
  };

  const handleExcludeRecord = (id) => {
    setPreviewRecords((prev) => prev.filter((rec) => rec.id !== id));
    showNotification("Registro excluido de la exportación", "info");
  };

  const handleFetchPreview = async () => {
    setPreviewLoading(true);
    try {
      showNotification("Buscando registros coincidentes...", "info");

      let queryParams = `?reportType=${customReportType}&preview=true`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      if (customReportType === "accidents") {
        if (selectedManagement)
          queryParams += `&managementId=${selectedManagement}`;
        if (accidentTypeId) queryParams += `&accidentTypeId=${accidentTypeId}`;
        if (processStatusId)
          queryParams += `&processStatusId=${processStatusId}`;
      } else {
        if (selectedFacility) queryParams += `&facilityId=${selectedFacility}`;
        if (inspectionType) queryParams += `&inspectionType=${inspectionType}`;
        if (inspectionStatusId)
          queryParams += `&statusId=${inspectionStatusId}`;
      }

      const res = await api.get(`/reports/custom${queryParams}`);
      clearNotifications();
      if (res && !res.err) {
        setPreviewRecords(res);
        showNotification(
          `Búsqueda finalizada. ${res.length} registros encontrados.`,
          "success",
        );
      } else {
        setPreviewRecords([]);
        showNotification(
          "No se encontraron registros coincidentes.",
          "warning",
        );
      }
    } catch (error) {
      clearNotifications();
      showNotification("Error al previsualizar registros", "error");
      setPreviewRecords([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
            <BarChart3 className="text-corpoelec-blue" size={28} />
            Centro de Reportes y Estadísticas
          </h2>
          <p className="text-txt-muted mt-1 text-[11px] font-medium uppercase tracking-widest">
            Análisis de indicadores ASHO y gestión operativa.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Selector de Período/Año */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest block">
              Año / Período
            </span>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="bg-bg-main/80 border border-border-main/60 hover:border-corpoelec-blue/50 text-xs font-bold text-txt-main rounded-2xl px-4 py-3 outline-none focus:border-corpoelec-blue focus:ring-1 focus:ring-corpoelec-blue transition-all cursor-pointer min-w-[160px]"
            >
              <option value="all">Ver Todos</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  Gestión {p.annuality}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {[
          {
            label: "Accidentes Registrados",
            value: stats.accidents,
            icon: ShieldAlert,
            color: "text-corpoelec-red",
            bg: "bg-corpoelec-red/10",
          },
          {
            label: "Personal Activo",
            value: stats.employees,
            icon: Users,
            color: "text-corpoelec-blue",
            bg: "bg-corpoelec-blue/10",
          },
          isAdmin && {
            label: "Usuarios Sistema",
            value: stats.users,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Inspecciones Realizadas",
            value: stats.inspections,
            icon: FileText,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].filter(Boolean).map((kpi, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 rounded-[2rem] border border-border-main/50 space-y-4 relative overflow-hidden group"
          >
            <div
              className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} w-fit shadow-inner`}
            >
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-1">
                {kpi.label}
              </p>
              {loading ? (
                <Loader2 size={24} className="animate-spin text-txt-muted/50" />
              ) : (
                <p className="text-3xl font-black text-txt-main tracking-tighter tabular-nums">
                  {kpi.value.toLocaleString()}
                </p>
              )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Charts (Visual Mockups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Mockup */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-corpoelec-blue" />
              Tendencia de Accidentes
            </h3>
            <div className="flex gap-4 items-center select-none">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-txt-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-corpoelec-blue shadow-[0_0_8px_rgba(0,92,158,0.4)]" />
                <span>Inspecciones</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-txt-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-corpoelec-red shadow-[0_0_8px_rgba(227,6,19,0.4)]" />
                <span>Accidentes</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 px-2 pt-10">
            {monthlyTrend.map((val, i) => {
              const maxTrendVal = Math.max(
                ...monthlyTrend.map((t) => t.total),
                1,
              );
              const percentage =
                maxTrendVal > 0 ? (val.total / maxTrendVal) * 80 + 10 : 10;
              const accidentsPercent =
                val.total > 0 ? (val.accidents / val.total) * 100 : 0;
              const inspectionsPercent =
                val.total > 0 ? (val.inspections / val.total) * 100 : 0;

              return (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative"
                >
                  <div className="text-[10px] font-black text-txt-main mb-1.5 transition-transform duration-300 group-hover:scale-110">
                    {val.total}
                  </div>
                  <div
                    className={`w-full h-40 rounded-full relative overflow-hidden flex flex-col justify-end border cursor-pointer transition-all duration-700 ${
                      val.total > 0
                        ? "bg-bg-main/20 border-border-main/20 shadow-inner"
                        : "bg-bg-main/10 border-border-main/40 hover:border-corpoelec-blue/30"
                    }`}
                    title={`Total: ${val.total} Accidentes (Inspecciones: ${val.inspections}, Accidentes: ${val.accidents})`}
                    style={{ height: `${percentage}%` }}
                  >
                    {val.total > 0 && (
                      <>
                        {/* Accidentes (Red part - top) */}
                        <div
                          className="w-full bg-gradient-to-t from-corpoelec-red/70 to-corpoelec-red hover:brightness-110 transition-all duration-700"
                          style={{ height: `${accidentsPercent}%` }}
                          title={`${val.accidents} Accidentes`}
                        />
                        {/* Inspecciones (Blue part - bottom) */}
                        <div
                          className="w-full bg-gradient-to-t from-corpoelec-blue/60 to-corpoelec-blue border-t border-white/10 hover:brightness-110 transition-all duration-700"
                          style={{ height: `${inspectionsPercent}%` }}
                          title={`${val.inspections} Inspecciones`}
                        />
                      </>
                    )}
                  </div>
                  <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest mt-2">
                    {
                      [
                        "E",
                        "F",
                        "M",
                        "A",
                        "M",
                        "J",
                        "J",
                        "A",
                        "S",
                        "O",
                        "N",
                        "D",
                      ][i]
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution by Accident Type – real data donut */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
            <PieChartIcon size={16} className="text-corpoelec-blue" />
            Distribución por Tipo de Accidente
          </h3>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-txt-muted/40" />
            </div>
          ) : accidentDistribution.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <ShieldAlert size={32} className="text-txt-muted/30" />
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-wider">
                Sin accidentes registrados
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-around h-64 relative">
              {/* SVG Donut Chart */}
              <div className="relative w-44 h-44 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const CIRC = 2 * Math.PI * 38; // ~238.76
                    let offset = 0;
                    return accidentDistribution.map((item, i) => {
                      const segLen = (item.pct / 100) * CIRC;
                      const gap = CIRC - segLen;
                      const el = (
                        <circle
                          key={i}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="16"
                          strokeDasharray={`${segLen} ${gap}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-700"
                        />
                      );
                      offset += segLen;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-black text-txt-main">
                    {stats.accidents}
                  </p>
                  <p className="text-[8px] font-black text-txt-muted uppercase tracking-[0.15em]">
                    Accidentes
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2.5 w-44 max-h-56 overflow-y-auto pr-1">
                {accidentDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[9px] font-black text-txt-main uppercase leading-tight truncate"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <p className="text-[9px] text-txt-muted font-bold">
                        {item.count} caso{item.count !== 1 ? "s" : ""} ·{" "}
                        {item.pct}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Export Section */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
        <div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
            <Download size={18} className="text-corpoelec-blue" />
            Descarga de Reportes y Documentación Oficial (PDF)
          </h3>
          <p className="text-txt-muted mt-1 text-[10px] uppercase font-bold tracking-wider">
            Generación de archivos certificados por el departamento de ASHO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payroll PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-corpoelec-blue/40 transition-all group">
            <div className="space-y-3">
              <div className="p-3 bg-corpoelec-blue/10 text-corpoelec-blue rounded-2xl w-fit">
                <Users size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">
                Roster / Nómina de Personal
              </h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Listado oficial completo de todo el personal activo en el
                sistema, detallando cargo, gerencia y cédula de identidad.
              </p>

              {/* Selector de modo */}
              <div className="flex gap-1 p-1 bg-bg-surface border border-border-main/30 rounded-xl w-full">
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, payroll: false }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!customMode.payroll ? "bg-corpoelec-blue text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Estándar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, payroll: true }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${customMode.payroll ? "bg-corpoelec-blue text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Personalizado
                </button>
              </div>

              {/* Checkboxes de Columnas */}
              {customMode.payroll && (
                <div className="space-y-1.5 p-3 bg-bg-surface border border-border-main/30 rounded-2xl">
                  <span className="text-[8px] font-black text-txt-muted uppercase tracking-wider block mb-1">
                    Campos a incluir:
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      { key: "personalNumber", label: "Ficha / Pers." },
                      { key: "idCard", label: "Cédula" },
                      { key: "fullName", label: "Nombre Completo" },
                      { key: "management", label: "Gerencia" },
                      { key: "jobTitle", label: "Cargo" },
                      { key: "occupation", label: "Ocupación" },
                      { key: "phone", label: "Teléfono" },
                      { key: "gender", label: "Género" },
                      { key: "birthDate", label: "Fec. Nacimiento" },
                      { key: "email", label: "Correo" },
                      { key: "maritalStatus", label: "Estado Civil" },
                      { key: "dominantHand", label: "Lateralidad" },
                      { key: "birthPlace", label: "Lugar Nacimiento" },
                      { key: "homeAddress", label: "Dirección" },
                      { key: "educationLevel", label: "Niv. Educativo" },
                      { key: "hireDate", label: "Fec. Ingreso" },
                      { key: "officePhone", label: "Tel. Oficina" },
                    ].map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 text-[10px] font-semibold text-txt-sub cursor-pointer hover:text-txt-main transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCols.payroll.includes(col.key)}
                          onChange={(e) =>
                            handleColChange(
                              "payroll",
                              col.key,
                              e.target.checked,
                            )
                          }
                          className="accent-corpoelec-blue rounded cursor-pointer"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={downloading.payroll}
              onClick={() =>
                handleDownload(
                  "payroll",
                  "/reports/payroll",
                  "nomina_personal.pdf",
                )
              }
              className="btn-primary w-full h-11 text-xs justify-center gap-2"
            >
              {downloading.payroll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Nómina</span>
            </button>
          </div>

          {/* Accidents List PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-corpoelec-red/40 transition-all group">
            <div className="space-y-3">
              <div className="p-3 bg-corpoelec-red/10 text-corpoelec-red rounded-2xl w-fit">
                <ShieldAlert size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">
                Histórico de Accidentes
              </h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Reporte consolidado del listado general de todos los accidentes
                registrados, con fecha, tipo y estatus del caso.
              </p>

              {/* Selector de modo */}
              <div className="flex gap-1 p-1 bg-bg-surface border border-border-main/30 rounded-xl w-full">
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, accidents: false }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!customMode.accidents ? "bg-corpoelec-red text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Estándar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, accidents: true }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${customMode.accidents ? "bg-corpoelec-red text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Personalizado
                </button>
              </div>

              {/* Checkboxes de Columnas */}
              {customMode.accidents && (
                <div className="space-y-1.5 p-3 bg-bg-surface border border-border-main/30 rounded-2xl">
                  <span className="text-[8px] font-black text-txt-muted uppercase tracking-wider block mb-1">
                    Campos a incluir:
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      {
                        key: "accidentControlNumber",
                        label: "Código / Control",
                      },
                      { key: "accidentDate", label: "Fecha" },
                      { key: "accidentTime", label: "Hora" },
                      { key: "accidentType", label: "Tipo de Accidente" },
                      { key: "facility", label: "Instalación" },
                      { key: "management", label: "Gerencia" },
                      { key: "status", label: "Estatus" },
                      { key: "description", label: "Descripción" },
                      { key: "medicalCenterName", label: "Centro Médico" },
                      { key: "medicalObservations", label: "Obs. Médicas" },
                      { key: "globalObservations", label: "Obs. Globales" },
                    ].map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 text-[10px] font-semibold text-txt-sub cursor-pointer hover:text-txt-main transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCols.accidents.includes(col.key)}
                          onChange={(e) =>
                            handleColChange(
                              "accidents",
                              col.key,
                              e.target.checked,
                            )
                          }
                          className="accent-corpoelec-red rounded cursor-pointer"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={downloading.accidents}
              onClick={() =>
                handleDownload(
                  "accidents",
                  "/reports/accidents",
                  "listado_accidentes.pdf",
                )
              }
              className="btn-primary w-full h-11 text-xs justify-center gap-2 !bg-corpoelec-red hover:!bg-corpoelec-red/90"
            >
              {downloading.accidents ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Accidentes</span>
            </button>
          </div>

          {/* Inspections List PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
                <FileText size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">
                Histórico de Inspecciones
              </h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Compendio completo de todas las inspecciones de seguridad
                realizadas (generales, extintores y vehicular).
              </p>

              {/* Selector de modo */}
              <div className="flex gap-1 p-1 bg-bg-surface border border-border-main/30 rounded-xl w-full">
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, inspections: false }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!customMode.inspections ? "bg-amber-500 text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Estándar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomMode((prev) => ({ ...prev, inspections: true }))
                  }
                  className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${customMode.inspections ? "bg-amber-500 text-white shadow-sm" : "text-txt-muted hover:text-txt-main"}`}
                >
                  Personalizado
                </button>
              </div>

              {/* Checkboxes de Columnas */}
              {customMode.inspections && (
                <div className="space-y-1.5 p-3 bg-bg-surface border border-border-main/30 rounded-2xl">
                  <span className="text-[8px] font-black text-txt-muted uppercase tracking-wider block mb-1">
                    Campos a incluir:
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {[
                      { key: "inspectionNumber", label: "Código / Inspección" },
                      { key: "date", label: "Fecha" },
                      { key: "facility", label: "Instalación" },
                      { key: "inspector", label: "Inspector" },
                      { key: "typeStatus", label: "Tipo Inspección" },
                      { key: "status", label: "Estatus" },
                      { key: "coordinates", label: "Coordenadas" },
                      { key: "observations", label: "Observaciones" },
                    ].map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 text-[10px] font-semibold text-txt-sub cursor-pointer hover:text-txt-main transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCols.inspections.includes(col.key)}
                          onChange={(e) =>
                            handleColChange(
                              "inspections",
                              col.key,
                              e.target.checked,
                            )
                          }
                          className="accent-amber-500 rounded cursor-pointer"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={downloading.inspections}
              onClick={() =>
                handleDownload(
                  "inspections",
                  "/reports/inspections",
                  "listado_inspecciones.pdf",
                )
              }
              className="btn-primary w-full h-11 text-xs justify-center gap-2 !bg-amber-500 hover:!bg-amber-600"
            >
              {downloading.inspections ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Inspecciones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generador Personalizado de Reportes PDF (Filtros Dinámicos & Live Preview) */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6 animate-in fade-in duration-500">
        <div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
            <Filter size={18} className="text-corpoelec-blue" />
            Generador de Reportes Personalizados (Búsqueda Avanzada)
          </h3>
          <p className="text-txt-muted mt-1 text-[10px] uppercase font-bold tracking-wider">
            Filtra información por cualquier criterio, previsualiza los
            resultados en vivo y descarga el documento oficial PDF
            personalizado.
          </p>
        </div>

        {/* Filters Grid */}
        <div className="bg-bg-main/20 p-6 rounded-3xl border border-border-main/40 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Tipo de Reporte */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                Módulo de Búsqueda
              </label>
              <select
                value={customReportType}
                onChange={(e) => {
                  setCustomReportType(e.target.value);
                  setSelectedManagement("");
                  setSelectedFacility("");
                  setAccidentTypeId("");
                  setProcessStatusId("");
                  setInspectionType("");
                  setInspectionStatusId("");
                  setPreviewRecords(null);
                }}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              >
                <option value="accidents">INVESTIGACIÓN DE ACCIDENTES</option>
                <option value="inspections">INSPECCIONES Y AUDITORÍAS</option>
              </select>
            </div>

            {/* 2. Fecha de Inicio */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                Fecha Desde (Inicio)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              />
            </div>

            {/* 3. Fecha de Fin */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                Fecha Hasta (Fin)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              />
            </div>
          </div>

          <div className="border-t border-border-main/20 pt-4">
            <span className="text-[8px] font-black text-corpoelec-blue uppercase tracking-widest block mb-4">
              Criterios de Investigación Específica
            </span>

            {customReportType === "accidents" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* A1. Gerencia */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Gerencia Responsable
                  </label>
                  <select
                    value={selectedManagement}
                    onChange={(e) => setSelectedManagement(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS GERENCIAS</option>
                    {managements.map((mgt) => (
                      <option key={mgt.id} value={mgt.id}>
                        {mgt.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* A2. Tipo de Accidente */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Tipo de Lesión/Incidente
                  </label>
                  <select
                    value={accidentTypeId}
                    onChange={(e) => setAccidentTypeId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS TIPOS</option>
                    {accidentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* A3. Estatus de Proceso */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Estado del Proceso
                  </label>
                  <select
                    value={processStatusId}
                    onChange={(e) => setProcessStatusId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS ESTADOS</option>
                    {inspectionStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* I1. Sede */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Sede o Centro de Trabajo
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS SEDES</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* I2. Tipo de Inspección */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Tipo de Inspección
                  </label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS PLANILLAS</option>
                    <option value="extinguishers">
                      INSPECCIÓN DE EXTINTORES
                    </option>
                    <option value="vehicles">
                      INSPECCIÓN VEHICULAR (FLOTA)
                    </option>
                    <option value="protection">
                      EQUIPOS DE PROTECCIÓN (EPI)
                    </option>
                  </select>
                </div>

                {/* I3. Estado Inspección */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">
                    Estado de Evaluación
                  </label>
                  <select
                    value={inspectionStatusId}
                    onChange={(e) => setInspectionStatusId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS ESTADOS</option>
                    {inspectionStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-4 border-b border-border-main/30 pb-4">
          <div>
            {previewRecords !== null && (
              <span className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest bg-corpoelec-blue/10 px-4 py-2 rounded-xl border border-corpoelec-blue/20">
                Coincidencias encontradas: {previewRecords.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              disabled={previewLoading}
              onClick={handleFetchPreview}
              className="btn-secondary h-11 text-[10px] font-black uppercase tracking-widest gap-2"
            >
              {previewLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin text-corpoelec-blue"
                />
              ) : (
                <Filter size={14} />
              )}
              <span>Buscar y Previsualizar</span>
            </button>

            {/* Download PDF Button */}
            <button
              disabled={
                customDownloading ||
                !previewRecords ||
                previewRecords.length === 0
              }
              onClick={handleDownloadCustomReport}
              className="btn-primary h-11 text-[10px] font-black uppercase tracking-widest gap-2 bg-corpoelec-blue hover:bg-corpoelec-blue/90 px-5 rounded-xl text-white transition-all flex items-center shadow-md disabled:opacity-30 disabled:pointer-events-none"
            >
              {customDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* live PREVIEW AREA */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
            Vista Previa de Registros a Exportar
          </span>

          {previewLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-bg-main/10 rounded-3xl border border-border-main/30">
              <Loader2 size={36} className="text-corpoelec-blue animate-spin" />
              <p className="text-[10px] font-black uppercase text-txt-muted tracking-[0.2em]">
                Escaneando base de datos...
              </p>
            </div>
          ) : previewRecords === null ? (
            <div className="text-center py-14 bg-bg-main/5 border border-border-main/30 rounded-3xl text-txt-muted text-xs italic">
              Aplica los filtros deseados y presiona "Buscar y Previsualizar"
              para revisar los registros antes de exportar el PDF.
            </div>
          ) : previewRecords.length === 0 ? (
            <div className="text-center py-14 bg-bg-main/5 border border-border-main/30 rounded-3xl text-corpoelec-red font-black text-[10px] uppercase tracking-widest">
              No se encontraron registros que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem] shadow-sm">
              <div className="overflow-x-auto no-scrollbar max-h-[40vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-bg-surface border-b border-border-main shadow-sm">
                    {customReportType === "accidents" ? (
                      <tr className="bg-bg-main/20 text-[9px] uppercase font-black text-txt-muted tracking-widest border-b border-border-main">
                        <th className="px-5 py-3">Nro de Caso</th>
                        <th className="px-5 py-3">Fecha del Accidente</th>
                        <th className="px-5 py-3">Tipo de Lesión</th>
                        <th className="px-5 py-3">Gerencia Responsable</th>
                        <th className="px-5 py-3">Instalación</th>
                        <th className="px-5 py-3">Estatus</th>
                        <th className="px-5 py-3 text-center">Excluir</th>
                      </tr>
                    ) : (
                      <tr className="bg-bg-main/20 text-[9px] uppercase font-black text-txt-muted tracking-widest border-b border-border-main">
                        <th className="px-5 py-3">Código</th>
                        <th className="px-5 py-3">Fecha Auditoría</th>
                        <th className="px-5 py-3">Sede Evaluada</th>
                        <th className="px-5 py-3">Inspector a Cargo</th>
                        <th className="px-5 py-3">Tipo Inspección</th>
                        <th className="px-5 py-3">Estatus</th>
                        <th className="px-5 py-3 text-center">Excluir</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-border-main/20 text-xs text-txt-sub">
                    {customReportType === "accidents"
                      ? previewRecords.map((acc, index) => (
                          <tr
                            key={acc.id}
                            className="hover:bg-bg-main/10 transition-colors"
                          >
                            <td className="px-5 py-3.5 font-bold font-mono text-corpoelec-blue">
                              {acc.inpsaselFileNumber ||
                                `ACC-${String(acc.id).padStart(4, "0")}`}
                            </td>
                            <td className="px-5 py-3.5 font-semibold">
                              {formatLocalDate(acc.accidentDate)}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-txt-main uppercase">
                              {acc.type?.name || "General"}
                            </td>
                            <td className="px-5 py-3.5 font-semibold uppercase">
                              {acc.management?.name || "-"}
                            </td>
                            <td className="px-5 py-3.5 font-semibold uppercase text-txt-muted">
                              {acc.facility?.name || "-"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-corpoelec-red/10 text-corpoelec-red border border-corpoelec-red/20 uppercase tracking-tighter">
                                {acc.processStatus?.name || "REGISTRADO"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => handleExcludeRecord(acc.id)}
                                className="p-1.5 hover:bg-corpoelec-red/10 text-corpoelec-red rounded-lg transition-colors inline-flex items-center justify-center border border-transparent hover:border-corpoelec-red/20"
                                title="Excluir de este reporte"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      : previewRecords.map((insp, index) => {
                          let typeStr = "General";
                          if (insp.extinguisherInspection)
                            typeStr = "Extintores";
                          else if (insp.vehicleInspection)
                            typeStr = "Vehicular";
                          else if (insp.protectionInspection)
                            typeStr = "Protección EPI";

                          return (
                            <tr
                              key={insp.id}
                              className="hover:bg-bg-main/10 transition-colors"
                            >
                              <td className="px-5 py-3.5 font-bold font-mono text-corpoelec-blue">
                                {insp.inspectionNumber ||
                                  `INSP-${String(insp.id).padStart(4, "0")}`}
                              </td>
                              <td className="px-5 py-3.5 font-semibold">
                                {formatLocalDate(insp.date)}
                              </td>
                              <td className="px-5 py-3.5 font-bold text-txt-main uppercase">
                                {insp.facility?.name || "-"}
                              </td>
                              <td className="px-5 py-3.5 font-semibold uppercase">
                                {insp.inspector
                                  ? `${insp.inspector.lastName}, ${insp.inspector.firstName}`
                                  : "-"}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/20 uppercase">
                                  {typeStr}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    insp.statusId === 3
                                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                      : insp.statusId === 2
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        : "bg-txt-muted/10 text-txt-muted border border-border-main"
                                  }`}
                                >
                                  {insp.status?.name || "EN PROCESO"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => handleExcludeRecord(insp.id)}
                                  className="p-1.5 hover:bg-corpoelec-red/10 text-corpoelec-red rounded-lg transition-colors inline-flex items-center justify-center border border-transparent hover:border-corpoelec-red/20"
                                  title="Excluir de este reporte"
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
