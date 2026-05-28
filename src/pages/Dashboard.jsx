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
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const api = helpFetch();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    facilities: 0,
    employees: 0,
    accidents: 0,
    inspectionsTotal: 0,
    extinguishersInsps: 0,
    protectionInsps: 0,
    vehiclesInsps: 0,
  });

  const [monthlyAccidents, setMonthlyAccidents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    statusPending: 0,
    statusInProcess: 0,
    statusCompleted: 0,
    topTypes: [],
    topFacilities: [],
  });

  const [activeTab, setActiveTab] = useState("types"); // "types" | "facilities"

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [accRes, empRes, facRes, insRes] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          api.get("/facilities"),
          api.get("/inspections"),
        ]);

        const accidentsList = Array.isArray(accRes) ? accRes : [];
        const employeesList = Array.isArray(empRes) ? empRes : [];
        const facilitiesList = Array.isArray(facRes) ? facRes : [];
        const inspectionsList = Array.isArray(insRes) ? insRes : [];

        // Filter inspections by category types
        const extList = inspectionsList.filter(
          (i) => i.type === "Extintor" || i.extinguisherInspection,
        );
        const protList = inspectionsList.filter(
          (i) => i.type === "Proteccion" || i.protectionInspection,
        );
        const vehList = inspectionsList.filter(
          (i) => i.type === "Vehiculo" || i.vehicleInspection,
        );

        setCounts({
          facilities: facilitiesList.length,
          employees: employeesList.length,
          accidents: accidentsList.length,
          inspectionsTotal: inspectionsList.length,
          extinguishersInsps: extList.length,
          protectionInsps: protList.length,
          vehiclesInsps: vehList.length,
        });

        // 1. Group accidents by the last 6 months dynamically
        const months = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ];
        const now = new Date();
        const chartData = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mName = months[d.getMonth()];
          const mYear = d.getFullYear().toString().substring(2);

          const count = accidentsList.filter((acc) => {
            if (!acc.date && !acc.accidentDate) return false;
            const dateStr = acc.date || acc.accidentDate;
            const accDate = new Date(dateStr);
            return (
              accDate.getMonth() === d.getMonth() &&
              accDate.getFullYear() === d.getFullYear()
            );
          }).length;

          chartData.push({
            label: `${mName} '${mYear}`,
            count: count,
          });
        }
        setMonthlyAccidents(chartData);

        // 2. Build additional custom statistics
        const statusPending = accidentsList.filter((a) => a.processStatusId === 1 || !a.processStatusId).length;
        const statusInProcess = accidentsList.filter((a) => a.processStatusId === 2).length;
        const statusCompleted = accidentsList.filter((a) => a.processStatusId === 3).length;

        // Top accident types
        const typesMap = {};
        accidentsList.forEach((a) => {
          const typeName = a.type?.name || "No clasificado";
          typesMap[typeName] = (typesMap[typeName] || 0) + 1;
        });
        const topTypes = Object.entries(typesMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        // Top facilities with accidents
        const facsMap = {};
        accidentsList.forEach((a) => {
          const facName = a.facility?.name || "Extramuros / Externa";
          facsMap[facName] = (facsMap[facName] || 0) + 1;
        });
        const topFacilities = Object.entries(facsMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        setStats({
          statusPending,
          statusInProcess,
          statusCompleted,
          topTypes,
          topFacilities,
        });

        // 3. Build combined real-time activity feed
        const combinedEvents = [];

        accidentsList.forEach((acc) => {
          const name = acc.involvedEmployees?.[0]?.employee
            ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
            : "PERSONAL";

          const dateVal = acc.date || acc.accidentDate;

          combinedEvents.push({
            id: `acc-${acc.id}`,
            type: "accident",
            title: `Accidente: ${name}`,
            ref: acc.facility?.name || "INSTALACIÓN",
            time: dateVal
              ? new Date(dateVal).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                })
              : "RECIENTE",
            path: "/accidents/register",
            rawDate: dateVal ? new Date(dateVal) : new Date(0),
          });
        });

        inspectionsList.forEach((ins) => {
          let typeLabel = "Auditoría ASHO";
          let path = "/inspections/extinguishers";

          if (ins.type === "Extintor" || ins.extinguisherInspection) {
            typeLabel = "Inspecc. Extintor";
            path = "/inspections/extinguishers";
          } else if (ins.type === "Proteccion" || ins.protectionInspection) {
            typeLabel = "Inspecc. EPP/EPC";
            path = "/protection/inspections";
          } else if (ins.type === "Vehiculo" || ins.vehicleInspection) {
            typeLabel = "Inspecc. Vehículo";
            path = "/inspections/vehicles";
          }

          combinedEvents.push({
            id: `ins-${ins.id}`,
            type: "inspection",
            title: `${typeLabel} #${ins.inspectionNumber || ins.id}`,
            ref: ins.facility?.name || "SEDE",
            time: ins.date
              ? new Date(ins.date).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                })
              : "RECIENTE",
            path,
            rawDate: ins.date ? new Date(ins.date) : new Date(0),
          });
        });

        // Sort chronologically (newest first) and select top 5
        const sorted = combinedEvents
          .sort((a, b) => b.rawDate - a.rawDate)
          .slice(0, 5);
        setRecentActivity(sorted);
      } catch (err) {
        showNotification(
          "Error al cargar indicadores dinámicos del Dashboard",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calculate scaling for dynamic chart bars
  const maxAccidentCount = Math.max(...monthlyAccidents.map((m) => m.count), 1);
  const totalInvolvedStats = stats.statusPending + stats.statusInProcess + stats.statusCompleted;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-txt-main">
      {/* Welcome Header */}
      <div className="relative group select-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-corpoelec-blue to-emerald-600 rounded-[2rem] blur opacity-10 group-hover:opacity-15 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-bg-surface backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-border-main/50">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
              Resumen de Gestión{" "}
              <Zap
                size={24}
                className="text-amber-400 fill-amber-400 animate-pulse animate-duration-1000"
              />
            </h2>
            <p className="text-txt-muted max-w-xl text-xs md:text-sm leading-relaxed">
              El panel de control ASHO reporta una{" "}
              <span className="text-emerald-500 font-black uppercase">
                Gestión Sincronizada
              </span>
              . Los indicadores corresponden a los registros en tiempo real extraídos de la infraestructura del sistema.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-bg-main/40 px-5 py-3.5 rounded-2xl border border-border-main/60 self-stretch md:self-auto justify-center">
            <Sparkles size={16} className="text-corpoelec-blue animate-pulse" />
            <div className="text-left">
              <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest block">
                Última Sincronización
              </span>
              <span className="text-xs font-bold text-txt-main">
                {new Date().toLocaleDateString("es-VE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-black tracking-tighter">
        {/* KPI: Sedes */}
        <div
          onClick={() => navigate("/infra/facilities")}
          className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-corpoelec-blue/30 transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer hover:scale-[1.02] duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-corpoelec-blue/10 text-corpoelec-blue group-hover:scale-110 transition-transform">
              <Building size={26} />
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">
              Sedes
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Instalaciones Activas
            </p>
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin text-txt-muted/30 mt-2"
              />
            ) : (
              <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">
                {counts.facilities}
              </h3>
            )}
          </div>
        </div>

        {/* KPI: Personal */}
        <div
          onClick={() => navigate("/hr/employees")}
          className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer hover:scale-[1.02] duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Users size={26} />
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">
              RRHH
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Personal Registrado
            </p>
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin text-txt-muted/30 mt-2"
              />
            ) : (
              <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">
                {counts.employees}
              </h3>
            )}
          </div>
        </div>

        {/* KPI: Inspecciones */}
        <div
          onClick={() => navigate("/inspections/extinguishers")}
          className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-amber-500/30 transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer hover:scale-[1.02] duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <FileCheck size={26} />
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">
              ASHO
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Inspecciones Realizadas
            </p>
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin text-txt-muted/30 mt-2"
              />
            ) : (
              <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">
                {counts.inspectionsTotal}
              </h3>
            )}
          </div>
        </div>

        {/* KPI: Accidentes */}
        <div
          onClick={() => navigate("/accidents/register")}
          className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-corpoelec-red/30 transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer hover:scale-[1.02] duration-300"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 rounded-2xl bg-corpoelec-red/10 text-corpoelec-red group-hover:scale-110 transition-transform">
              <AlertCircle size={26} />
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">
              Seguridad
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Incidentes Reportados
            </p>
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin text-txt-muted/30 mt-2"
              />
            ) : (
              <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">
                {counts.accidents}
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Sections: Chart & Breakdown & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Chart & Audit Split */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart Card */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10 relative z-10 select-none">
              <div className="space-y-1">
                <h4 className="text-lg md:text-xl font-black text-txt-main uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp size={20} className="text-corpoelec-red" />
                  Historial de Incidentes
                </h4>
                <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                  Estadísticas reales de accidentabilidad de los últimos 6 meses
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-bg-main/5 text-[9px] font-black uppercase text-txt-muted border border-border-main/50">
                Línea de Tiempo
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2
                  size={32}
                  className="animate-spin text-corpoelec-blue"
                />
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-4 px-4 relative z-10">
                {monthlyAccidents.map((m, idx) => {
                  const percentage =
                    maxAccidentCount > 0
                      ? (m.count / maxAccidentCount) * 80 + 10
                      : 10;
                  return (
                    <div
                      key={idx}
                      className="group flex-1 flex flex-col items-center gap-3"
                    >
                      <div className="text-[10px] font-black text-corpoelec-red opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-1">
                        {m.count}
                      </div>
                      <div
                        className={`w-full rounded-2xl transition-all duration-700 cursor-pointer ${
                          m.count > 0
                            ? "bg-corpoelec-red/20 border border-corpoelec-red/40 hover:bg-corpoelec-red hover:shadow-[0_0_20px_rgba(227,6,19,0.25)]"
                            : "bg-bg-main/20 border border-border-main/60 hover:border-corpoelec-blue/30"
                        }`}
                        style={{ height: `${percentage}%` }}
                        title={`${m.count} incidentes`}
                      ></div>
                      <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest">
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accident Breakdown & Distribution Panel */}
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 select-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="space-y-1">
                <h4 className="text-md font-black text-txt-main uppercase tracking-tight">
                  Distribución Analítica de Incidentes
                </h4>
                <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                  Análisis cruzado por estado de flujo y tipos más comunes
                </p>
              </div>
              <div className="flex bg-bg-main/40 p-1 rounded-xl border border-border-main/60 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("types")}
                  className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                    activeTab === "types"
                      ? "bg-bg-surface text-corpoelec-blue shadow-sm border border-border-main/50"
                      : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Tipos de Suceso
                </button>
                <button
                  onClick={() => setActiveTab("facilities")}
                  className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${
                    activeTab === "facilities"
                      ? "bg-bg-surface text-corpoelec-blue shadow-sm border border-border-main/50"
                      : "text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Por Instalación
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-corpoelec-blue" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Status Column Breakdown (Progress meters) */}
                <div className="md:col-span-1 space-y-4 bg-bg-main/20 p-6 rounded-3xl border border-border-main/40">
                  <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest block mb-1">
                    FLUJO DE INVESTIGACIONES
                  </span>
                  
                  {/* Pendientes */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-txt-main uppercase">
                      <span>Pendientes</span>
                      <span className="text-amber-500">{stats.statusPending}</span>
                    </div>
                    <div className="h-2 w-full bg-bg-main/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            totalInvolvedStats > 0
                              ? (stats.statusPending / totalInvolvedStats) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* En proceso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-txt-main uppercase">
                      <span>En Proceso</span>
                      <span className="text-corpoelec-blue">{stats.statusInProcess}</span>
                    </div>
                    <div className="h-2 w-full bg-bg-main/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-corpoelec-blue rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            totalInvolvedStats > 0
                              ? (stats.statusInProcess / totalInvolvedStats) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Cerrados */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-txt-main uppercase">
                      <span>Completados</span>
                      <span className="text-green-500">{stats.statusCompleted}</span>
                    </div>
                    <div className="h-2 w-full bg-bg-main/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            totalInvolvedStats > 0
                              ? (stats.statusCompleted / totalInvolvedStats) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Dynamic analytical meters based on active tab */}
                <div className="md:col-span-2 space-y-4">
                  {activeTab === "types" ? (
                    stats.topTypes.length === 0 ? (
                      <p className="text-xs text-txt-muted italic py-6">
                        No hay suficientes registros categorizados.
                      </p>
                    ) : (
                      stats.topTypes.map((t, index) => {
                        const totalTypesCount = Math.max(...stats.topTypes.map((x) => x.count), 1);
                        return (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-txt-main uppercase">
                              <span className="truncate max-w-[220px]">{t.name}</span>
                              <span className="text-txt-muted text-[10px]">{t.count} sopesados</span>
                            </div>
                            <div className="h-2.5 w-full bg-bg-main/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-corpoelec-red to-orange-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(t.count / totalTypesCount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : stats.topFacilities.length === 0 ? (
                    <p className="text-xs text-txt-muted italic py-6">
                      No hay suficientes registros por sedes.
                    </p>
                  ) : (
                    stats.topFacilities.map((f, index) => {
                      const totalFacsCount = Math.max(...stats.topFacilities.map((x) => x.count), 1);
                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-txt-main uppercase">
                            <span className="truncate max-w-[220px]">{f.name}</span>
                            <span className="text-txt-muted text-[10px]">{f.count} casos</span>
                          </div>
                          <div className="h-2.5 w-full bg-bg-main/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-corpoelec-blue to-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: `${(f.count / totalFacsCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Inspections Split Card */}
          <div className="glass-panel rounded-[2rem] p-6 md:p-8 border border-border-main/50 select-none">
            <h4 className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-5">
              Desglose de Inspecciones de Seguridad
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold uppercase tracking-wider">
              {/* Extintores */}
              <div
                onClick={() => navigate("/inspections/extinguishers")}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-4.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03] duration-350"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-emerald-500 tracking-widest block">
                    EXTINTORES
                  </span>
                  <span className="text-xl font-black text-txt-main">
                    {counts.extinguishersInsps}
                  </span>
                </div>
                <ShieldCheck size={20} className="text-emerald-500" />
              </div>

              {/* Equipos */}
              <div
                onClick={() => navigate("/protection/inspections")}
                className="bg-corpoelec-blue/5 hover:bg-corpoelec-blue/10 border border-corpoelec-blue/20 p-4.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03] duration-350"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-corpoelec-blue tracking-widest block">
                    EQUIPOS EPP/EPC
                  </span>
                  <span className="text-xl font-black text-txt-main">
                    {counts.protectionInsps}
                  </span>
                </div>
                <Zap size={20} className="text-corpoelec-blue" />
              </div>

              {/* Vehículos */}
              <div
                onClick={() => navigate("/inspections/vehicles")}
                className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 p-4.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:scale-[1.03] duration-350"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-purple-500 tracking-widest block">
                    VEHICULARES
                  </span>
                  <span className="text-xl font-black text-txt-main">
                    {counts.vehiclesInsps}
                  </span>
                </div>
                <Car size={20} className="text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Combined Activity Feed */}
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 border border-border-main/50 flex flex-col justify-between select-none">
          <div>
            <h4 className="text-xs font-black text-txt-main uppercase tracking-widest mb-8 pb-4 border-b border-border-main/50 flex items-center justify-between">
              <span>Actividad Reciente</span>
              <Award
                size={16}
                className="text-corpoelec-blue animate-spin-[20s] duration-1000"
              />
            </h4>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-2 text-txt-muted">
                <Loader2
                  size={24}
                  className="animate-spin text-corpoelec-blue"
                />
                <span className="text-[8px] font-black uppercase tracking-wider">
                  Cargando bitácora...
                </span>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="py-20 text-center text-txt-muted text-xs italic">
                Sin movimientos recientes registrados en el sistema.
              </div>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => navigate(act.path)}
                    className="flex gap-4 group cursor-pointer p-2.5 rounded-2xl hover:bg-bg-main/10 border border-transparent hover:border-border-main/40 transition-all duration-300"
                  >
                    {/* Event color indicator bar */}
                    <div
                      className={`w-1.5 h-10 rounded-full transition-all group-hover:w-2 shrink-0 ${
                        act.type === "accident"
                          ? "bg-corpoelec-red shadow-[0_0_10px_rgba(227,6,19,0.3)]"
                          : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      }`}
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className="text-xs font-bold text-txt-main uppercase truncate group-hover:text-corpoelec-blue transition-colors leading-tight"
                          title={act.title}
                        >
                          {act.title}
                        </p>
                        <ArrowUpRight
                          size={14}
                          className="text-txt-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-txt-muted">
                        <span className="truncate max-w-[120px]">
                          {act.ref}
                        </span>
                        <span className="text-corpoelec-blue bg-corpoelec-blue/5 px-1.5 py-0.5 rounded border border-corpoelec-blue/10 ml-2">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate("/reports")}
              className="w-full py-4 text-[9px] font-black text-txt-muted hover:text-corpoelec-blue hover:border-corpoelec-blue/30 bg-bg-main/5 hover:bg-corpoelec-blue/5 rounded-2xl transition-all uppercase tracking-widest border border-border-main/30 cursor-pointer"
            >
              Ver Bitácora de Gestión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

