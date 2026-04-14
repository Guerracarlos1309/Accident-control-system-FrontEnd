import { 
  AlertCircle, 
  FileCheck, 
  Users, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Zap,
  Building
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Sedes Activas", value: "24", icon: Building, color: "text-blue-500", trend: "+2 este mes" },
    { title: "EPIs Operativos", value: "1,240", icon: ShieldCheck, color: "text-emerald-500", trend: "98% de efectividad" },
    { title: "Inspecciones", value: "48", icon: FileCheck, color: "text-amber-500", trend: "12 pendientes" },
    { title: "Incidentes", value: "3", icon: AlertCircle, color: "text-red-500", trend: "-15% vs mes ant." },
  ];

  const recentActivity = [
    { id: 1, type: "accident", title: "Nuevo Accidente registrado", ref: "EXP-2024-001", time: "hace 2 horas", status: "Bajo revisión" },
    { id: 2, type: "inspection", title: "Inspección de Extintores finalizada", ref: "Sede Norte", time: "hace 5 horas", status: "Aprobado" },
    { id: 3, type: "fleet", title: "Mantenimiento Preventivo Vehículo", ref: "A12BC3D", time: "ayer", status: "En curso" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Bienvenido, Administrador <Zap size={24} className="text-amber-400 fill-amber-400" />
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl">
              El sistema de control integral ASHO reporta un estado de <span className="text-emerald-400 font-bold">Operatividad Óptima</span>. 
              Revise las alertas recientes para mantener los estándares de seguridad.
            </p>
          </div>
          <button className="btn-primary px-8 h-12 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Activity size={20} />
            <span>Resumen Ejecutivo</span>
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel group p-6 rounded-3xl border border-slate-800/50 hover:border-blue-500/30 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-slate-800 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                <TrendingUp size={10} />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-3xl font-black text-white mt-1 tabular-nums">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card (Visual Mockup) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-slate-800/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="text-xl font-bold text-white">Histórico de Incidentes</h4>
              <p className="text-sm text-slate-500">Tendencia de accidentabilidad últimos 6 meses</p>
            </div>
            <select className="bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-300 px-3 py-2 cursor-pointer outline-none ring-1 ring-slate-700">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[45, 30, 60, 40, 75, 45].map((h, i) => (
              <div key={i} className="group flex-1 flex flex-col items-center gap-3">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600/80 to-blue-400 rounded-xl transition-all duration-1000 group-hover:from-emerald-500 group-hover:to-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-200 transition-colors uppercase">Mes {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800/50">
          <h4 className="text-xl font-bold text-white mb-6">Actividad Reciente</h4>
          <div className="space-y-6">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex gap-4 group cursor-pointer">
                <div className={`w-1 h-auto rounded-full transition-all group-hover:w-1.5 ${
                  act.type === 'accident' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                  act.type === 'inspection' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{act.title}</p>
                    <ArrowUpRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono">{act.ref}</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white border-t border-slate-800 mt-4 transition-colors">
              VER TODA LA ACTIVIDAD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

