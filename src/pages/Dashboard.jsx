import { AlertCircle, FileCheck, Users } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Accidentes Activos", value: "3", icon: <AlertCircle className="text-red-500" size={24} /> },
    { title: "Inspecciones Pendientes", value: "12", icon: <FileCheck className="text-yellow-500" size={24} /> },
    { title: "Empleados Auditados", value: "850", icon: <Users className="text-blue-500" size={24} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Panel de Control
        </h2>
        <p className="text-slate-400 mt-1">Resumen general del estado del sistema de accidentes e inspecciones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel rounded-xl p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Aqui podria ir un grafico luego */}
      <div className="glass-panel rounded-xl p-6 h-64 flex items-center justify-center text-slate-500">
        Espacio para gráficos de tendencias
      </div>
    </div>
  );
}
