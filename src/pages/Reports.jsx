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
  Loader2
} from "lucide-react";
import { helpFetch } from "../helpers/helpFetch";

export default function ReportCenter() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    accidents: 0,
    employees: 0,
    users: 0,
    inspections: 124 // Mocked for now
  });

  const api = helpFetch();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [accRes, empRes, userRes] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          api.get("/users")
        ]);

        setStats({
          accidents: Array.isArray(accRes) ? accRes.length : 0,
          employees: Array.isArray(empRes) ? empRes.length : 0,
          users: Array.isArray(userRes) ? userRes.length : 0,
          inspections: 124
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
             <BarChart3 className="text-corpoelec-blue" size={28} />
             Centro de Reportes y Estadísticas
          </h2>
          <p className="text-txt-muted mt-1 text-[11px] font-medium uppercase tracking-widest">Análisis de indicadores ASHO y gestión operativa.</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary h-12">
             <Calendar size={18} />
             <span>Últimos 30 días</span>
           </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Accidentes Registrados", value: stats.accidents, icon: ShieldAlert, color: "text-corpoelec-red", bg: "bg-corpoelec-red/10" },
          { label: "Personal Activo", value: stats.employees, icon: Users, color: "text-corpoelec-blue", bg: "bg-corpoelec-blue/10" },
          { label: "Usuarios Sistema", value: stats.users, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Inspecciones Realizadas", value: stats.inspections, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-[2rem] border border-border-main/50 space-y-4 relative overflow-hidden group">
            <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} w-fit shadow-inner`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              {loading ? (
                <Loader2 size={24} className="animate-spin text-txt-muted/50" />
              ) : (
                <p className="text-3xl font-black text-txt-main tracking-tighter tabular-nums">{kpi.value.toLocaleString()}</p>
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
              Tendencia de Incidentes
            </h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-corpoelec-blue shadow-[0_0_10px_rgba(0,92,158,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-corpoelec-red shadow-[0_0_10px_rgba(227,6,19,0.5)]" />
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-2 pt-10">
             {[45, 78, 52, 91, 63, 84, 55, 67, 88, 42, 60, 75].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                 <div className="w-full bg-corpoelec-blue/10 rounded-full h-full relative overflow-hidden flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-corpoelec-blue/80 to-corpoelec-blue rounded-full transition-all duration-1000 group-hover:brightness-125"
                      style={{ height: `${val}%` }}
                    />
                 </div>
                 <span className="text-[9px] font-black text-txt-muted uppercase opacity-40">{['E','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                 <div className="absolute -top-6 bg-txt-main text-bg-main px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {val}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Distribution Mockup */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
           <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon size={16} className="text-corpoelec-blue" />
              Distribución por Severidad
            </h3>
            
            <div className="flex items-center justify-around h-64 relative">
               <div className="relative w-48 h-48">
                  {/* Mock Pie CSS-only segments */}
                  <div className="absolute inset-0 rounded-full border-[20px] border-emerald-500 border-l-transparent border-b-transparent rotate-45" />
                  <div className="absolute inset-0 rounded-full border-[20px] border-amber-500 border-t-transparent border-r-transparent -rotate-12" />
                  <div className="absolute inset-0 rounded-full border-[20px] border-corpoelec-red border-t-transparent border-r-transparent rotate-[60deg]" />
                  <div className="absolute inset-4 rounded-full bg-bg-surface flex flex-col items-center justify-center border border-border-main/50">
                    <p className="text-2xl font-black text-txt-main">100%</p>
                    <p className="text-[8px] font-black text-txt-muted uppercase tracking-[0.2em]">Analizado</p>
                  </div>
               </div>

               <div className="space-y-4 w-40">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Bajo Riesgo</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">65% Incidencias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Moderado</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">25% Incidencias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-corpoelec-red" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Crítico</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">10% Incidencias</p>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
