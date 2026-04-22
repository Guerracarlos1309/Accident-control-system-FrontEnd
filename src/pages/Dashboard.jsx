import { 
  AlertCircle, 
  FileCheck, 
  Users, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Zap,
  Building,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Sedes Activas", value: "0", icon: Building, color: "text-corpoelec-blue", trend: "Normal" },
    { title: "EPIs Operativos", value: "0", icon: ShieldCheck, color: "text-emerald-500", trend: "Protegido" },
    { title: "Inspecciones", value: "0", icon: FileCheck, color: "text-amber-500", trend: "Al día" },
    { title: "Accidentes", value: "0", icon: AlertCircle, color: "text-corpoelec-red", trend: "Controlado" },
  ]);

  const api = helpFetch();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [accRes, empRes, facRes] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          api.get("/facilities")
        ]);

        setStats([
          { title: "Sedes Activas", value: Array.isArray(facRes) ? facRes.length : 0, icon: Building, color: "text-corpoelec-blue", trend: "Infraestructura" },
          { title: "Personal Activo", value: Array.isArray(empRes) ? empRes.length : 0, icon: Users, color: "text-emerald-500", trend: "RRHH" },
          { title: "Inspecciones", value: 124, icon: FileCheck, color: "text-amber-500", trend: "ASHO" },
          { title: "Accidentes", value: Array.isArray(accRes) ? accRes.length : 0, icon: AlertCircle, color: "text-corpoelec-red", trend: "Incidentes" },
        ]);
      } catch (err) {
        showNotification("Error al actualizar indicadores", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const recentActivity = [
    { id: 1, type: "accident", title: "Monitoreo en Tiempo Real", ref: "Sincronizado", time: "Ahora", status: "Activo" },
    { id: 2, type: "inspection", title: "Validación de Seguridad", ref: "Base de Datos", time: "En línea", status: "Aprobado" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-corpoelec-blue to-emerald-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-bg-surface backdrop-blur-xl p-10 rounded-3xl border border-border-main/50">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
              Resumen de Gestión <Zap size={24} className="text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-txt-muted max-w-xl text-sm leading-relaxed">
              El sistema de control integral ASHO reporta un estado de <span className="text-emerald-500 font-black">Operatividad Óptima</span>. 
              Los indicadores mostrados corresponden a la sincronización en tiempo real con el backend de Corpoelec.
            </p>
          </div>
          <button className="btn-primary px-8 h-14">
            <Activity size={20} />
            <span>Métricas ASHO</span>
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel group p-6 rounded-[2rem] border border-border-main/50 hover:border-corpoelec-blue/30 transition-all hover:shadow-xl hover:shadow-black/5">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-bg-main/5 group-hover:bg-bg-main/10 group-hover:scale-105 transition-all ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-txt-muted uppercase tracking-widest bg-bg-main/5 px-2.5 py-1 rounded-full border border-border-main/50">
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">{stat.title}</p>
              {loading ? (
                <Loader2 size={18} className="animate-spin text-txt-muted/30 mt-2" />
              ) : (
                <h3 className="text-3xl font-black text-txt-main mt-1 tracking-tighter tabular-nums">{stat.value}</h3>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card (Visual Mockup) */}
        <div className="lg:col-span-2 glass-panel rounded-[2.5rem] p-10 border border-border-main/50 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="space-y-1">
              <h4 className="text-xl font-black text-txt-main uppercase tracking-tight">Histórico de Incidentes</h4>
              <p className="text-[11px] font-medium text-txt-muted uppercase tracking-widest">Tendencia de accidentabilidad últimos 6 meses</p>
            </div>
            <select className="input-field h-10 w-40 text-[10px] uppercase font-black tracking-widest bg-bg-surface">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4 relative z-10">
            {[45, 30, 60, 40, 75, 45].map((h, i) => (
              <div key={i} className="group flex-1 flex flex-col items-center gap-4">
                <div 
                  className="w-full bg-corpoelec-blue/10 rounded-2xl transition-all duration-1000 group-hover:bg-corpoelec-blue group-hover:shadow-[0_0_20px_rgba(0,92,158,0.2)]"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">Mes {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-[2.5rem] p-10 border border-border-main/50">
          <h4 className="text-sm font-black text-txt-main uppercase tracking-widest mb-10 pb-4 border-b border-border-main/50">Actividad Reciente</h4>
          <div className="space-y-8">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex gap-5 group cursor-pointer">
                <div className={`w-1 h-12 rounded-full transition-all group-hover:w-2 ${
                  act.type === 'accident' ? 'bg-corpoelec-red shadow-[0_0_10px_rgba(227,6,19,0.3)]' : 
                  act.type === 'inspection' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-corpoelec-blue shadow-[0_0_10px_rgba(0,92,158,0.3)]'
                }`} />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-black text-txt-main uppercase tracking-tight group-hover:text-corpoelec-blue transition-colors">{act.title}</p>
                    <ArrowUpRight size={14} className="text-txt-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-txt-muted font-black uppercase tracking-widest">{act.ref}</span>
                    <span className="text-[9px] font-black text-corpoelec-blue uppercase tracking-widest">{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-6">
               <button className="w-full py-4 text-[10px] font-black text-txt-muted hover:text-corpoelec-blue bg-bg-main/5 rounded-2xl transition-all uppercase tracking-widest border border-border-main/30">
                 Ver Auditoría Completa
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

