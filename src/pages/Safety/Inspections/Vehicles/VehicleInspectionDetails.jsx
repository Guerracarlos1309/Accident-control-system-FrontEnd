import { useState, useEffect } from "react";
import { 
  Loader2, 
  Calendar, 
  User, 
  MapPin, 
  Truck, 
  ClipboardCheck, 
  AlertCircle,
  Hash,
  Package,
  CheckCircle2,
  XCircle,
  Building2,
  Info
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";

export default function VehicleInspectionDetails({ inspectionId }) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = helpFetch();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/inspections/${inspectionId}`);
        if (res && !res.err) {
          setInspection(res);
        }
      } catch (error) {
        console.error("Error fetching inspection details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (inspectionId) fetchDetails();
  }, [inspectionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Recuperando reporte técnico...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-20 text-slate-500">
        <AlertCircle size={40} className="mx-auto mb-4 opacity-20" />
        <p>No se pudo cargar la información del reporte.</p>
      </div>
    );
  }

  const vInfo = inspection.vehicleInspection || {};
  const vehicle = vInfo.vehicle || {};

  return (
    <div className="space-y-8 pb-4">
      
      {/* HEADER: STATUS & KEY INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Estado del Reporte</span>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            inspection.statusId === 1 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            inspection.statusId === 2 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            "bg-slate-500/10 text-slate-500 border-slate-500/20"
          }`}>
            <ClipboardCheck size={12} />
            {inspection.status?.name || "Procesado"}
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Calendar size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Fecha de Auditoría</span>
              <p className="text-sm font-bold text-slate-200">{new Date(inspection.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
           </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Hash size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">N° de Inspección / Reporte</span>
              <p className="text-sm font-mono font-bold text-blue-400">
                {inspection.inspectionNumber || `#${inspection.id.toString().padStart(6, '0')}`}
              </p>
           </div>
        </div>
      </div>

      {/* VEHICLE TECH CARD */}
      <div className="glass-panel border-blue-500/20 bg-blue-500/5 p-6 rounded-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 transition-transform group-hover:scale-110">
            <Truck size={120} />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
               <div>
                  <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Unidad Inspeccionada</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white tracking-tighter">{vInfo.plateId}</span>
                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-slate-400 text-xs font-bold border border-slate-700">
                       {vehicle.type?.name || "Vehículo"}
                    </span>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Marca / Modelo</span>
                    <p className="text-sm text-slate-200 font-semibold">{vehicle.model?.brand?.name} {vehicle.model?.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Año</span>
                    <p className="text-sm text-slate-200 font-semibold">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Color</span>
                    <p className="text-sm text-slate-200 font-semibold">{vehicle.color}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 w-full md:w-auto">
               <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Auditor</span>
                    <span className="text-xs font-bold text-slate-300">{inspection.inspector?.firstName} {inspection.inspector?.lastName}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Building2 size={14} className="text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Ubicación</span>
                    <span className="text-xs font-bold text-slate-300">{inspection.facility?.name}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ACCESSORY CHECKLIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Package size={16} className="text-blue-500" />
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Resultado de Seguridad y Accesorios</h4>
        </div>
        
        <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/80 text-[10px] uppercase font-black text-slate-500 tracking-widest border-b border-slate-800">
                  <th className="px-6 py-4">Accesorio</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4">Observaciones del Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 bg-slate-900/20">
                {vInfo.accessoryChecks?.length > 0 ? (
                  vInfo.accessoryChecks.map((check) => (
                    <tr key={check.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-300">{check.accessory?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {check.status ? (
                            <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter">
                              <CheckCircle2 size={12} />
                              ÓPTIMO
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 text-[10px] font-black uppercase tracking-tighter">
                              <XCircle size={12} />
                              FALLA
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400 italic">
                          {check.observations || "Sin observaciones específicas."}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500 italic text-sm">
                      No se registraron verificaciones de accesorios en esta auditoría.
                    </td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>

      {/* FINAL FINDINGS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <AlertCircle size={16} className="text-slate-500" />
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Conclusiones del Reporte</h4>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
           <p className="text-slate-300 text-sm leading-relaxed">
             {inspection.observations || "El auditor no ha registrado hallazgos adicionales en la sección de conclusiones generales de este reporte."}
           </p>
        </div>
      </div>

    </div>
  );
}
