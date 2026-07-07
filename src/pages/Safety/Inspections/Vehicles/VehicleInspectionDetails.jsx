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
  Info,
  Download,
  Camera
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = typeof dateStr === "string" ? dateStr.split("T")[0] : "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    return new Date(cleanStr + "T00:00:00");
  }
  return new Date(dateStr);
};

export default function VehicleInspectionDetails({ inspectionId }) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const api = helpFetch();
  const { showNotification } = useNotification();

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

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      showNotification("Generando PDF...", "info");
      await api.download(`/reports/inspections/${inspectionId}`, `inspeccion_${inspection.inspectionNumber || inspection.id}.pdf`);
      showNotification("PDF descargado con éxito", "success");
    } catch (e) {
      showNotification("Error al generar PDF", "error");
    } finally {
      setDownloading(false);
    }
  };

  const vInfo = inspection.vehicleInspection || {};
  const vehicle = vInfo.vehicle || {};

  return (
    <div className="space-y-8 pb-4 text-txt-main">

      {/* TOP HEADER WITH EXPORT BUTTON */}
      <div className="flex justify-between items-center bg-bg-main/30 p-4 rounded-2xl border border-border-main">
        <div>
          <h3 className="text-xs font-black text-txt-main uppercase tracking-widest">Reporte Técnico ASHO</h3>
          <p className="text-[9px] text-txt-muted font-bold uppercase tracking-wider mt-0.5">Inspección de Flota Vehicular</p>
        </div>
        <button 
          disabled={downloading}
          onClick={handleDownloadPdf}
          className="btn-primary h-10 text-[10px] font-black uppercase tracking-widest gap-2 bg-corpoelec-blue hover:bg-corpoelec-blue/90 px-4 rounded-xl text-white transition-all flex items-center"
        >
          {downloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>Exportar PDF</span>
        </button>
      </div>
      
      {/* HEADER: STATUS & KEY INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-main/30 border border-border-main p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest block mb-2">Estado del Reporte</span>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            inspection.statusId === 1 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            inspection.statusId === 2 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            "bg-txt-muted/10 text-txt-muted border-border-main"
          }`}>
            <ClipboardCheck size={12} />
            {inspection.status?.name || "Procesado"}
          </div>
        </div>
        
        <div className="bg-bg-main/30 border border-border-main p-4 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue border border-corpoelec-blue/15">
              <Calendar size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">Fecha de Auditoría</span>
              <p className="text-sm font-bold text-txt-main">{parseLocalDate(inspection.date)?.toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
           </div>
        </div>

        <div className="bg-bg-main/30 border border-border-main p-4 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue border border-corpoelec-blue/15">
              <Hash size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">N° de Inspección / Reporte</span>
              <p className="text-sm font-mono font-bold text-corpoelec-blue uppercase">
                {inspection.inspectionNumber || `#${inspection.id.toString().padStart(6, '0')}`}
              </p>
           </div>
        </div>
      </div>

      {/* VEHICLE TECH CARD */}
      <div className="glass-panel border-corpoelec-blue/20 bg-corpoelec-blue/5 p-6 rounded-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 transition-transform group-hover:scale-110">
            <Truck size={120} />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
               <div>
                  <h4 className="text-[10px] font-black uppercase text-corpoelec-blue tracking-widest mb-1">Unidad Inspeccionada</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-txt-main tracking-tighter">{vInfo.plateId}</span>
                    <span className="px-3 py-1 bg-bg-main/30 rounded-lg text-txt-sub text-xs font-bold border border-border-main uppercase">
                       {vehicle.type?.name || "Vehículo"}
                    </span>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold tracking-tight">Marca / Modelo</span>
                    <p className="text-sm text-txt-sub font-semibold uppercase">{vehicle.model?.brand?.name} {vehicle.model?.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold tracking-tight">Año</span>
                    <p className="text-sm text-txt-sub font-semibold">{vehicle.year}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-txt-muted uppercase font-bold tracking-tight">Color</span>
                    <p className="text-sm text-txt-sub font-semibold uppercase">{vehicle.color}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 w-full md:w-auto">
               <div className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-main shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-bg-main/20 flex items-center justify-center border border-border-main">
                    <User size={16} className="text-txt-sub" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-txt-muted uppercase font-bold">Auditor</span>
                    <span className="text-xs font-bold text-txt-sub">{inspection.inspector?.firstName} {inspection.inspector?.lastName}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-main shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-bg-main/20 flex items-center justify-center border border-border-main">
                    <Building2 size={14} className="text-txt-sub" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-txt-muted uppercase font-bold">Gerencia / Cuadrilla</span>
                    <span className="text-xs font-bold text-txt-sub">
                      {vehicle.management?.name || <span className="italic text-txt-muted">No asignada</span>}
                    </span>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-main shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-bg-main/20 flex items-center justify-center border border-border-main">
                    <MapPin size={14} className="text-txt-sub" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-txt-muted uppercase font-bold">Ubicación</span>
                    <span className="text-xs font-bold text-txt-sub">{inspection.facility?.name}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-main shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/15">
                    <Calendar size={14} className="text-purple-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-txt-muted uppercase font-bold">Planificación</span>
                    <span className="text-xs font-bold text-txt-sub">
                      {inspection.isScheduled ? (
                        <span className="text-purple-500 font-bold uppercase">
                          PROGRAMADA ({parseLocalDate(inspection.scheduledDate)?.toLocaleDateString(undefined, { dateStyle: "short" }) || "-"})
                        </span>
                      ) : (
                        <span className="text-txt-muted">NO PROGRAMADA</span>
                      )}
                    </span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* ACCESSORY CHECKLIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Package size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-widest">Resultado de Seguridad y Accesorios</h4>
        </div>
        
        <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem] shadow-sm bg-bg-surface">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-main/20 text-[10px] uppercase font-black text-txt-muted tracking-[0.15em] border-b border-border-main">
                  <th className="px-6 py-4 text-center w-12">Nro</th>
                  <th className="px-6 py-4">Accesorio / Equipo</th>
                  <th className="px-6 py-4 text-center w-28">¿Existe?</th>
                  <th className="px-4 py-4 text-center w-24 bg-emerald-500/5 text-emerald-500">Sirve</th>
                  <th className="px-4 py-4 text-center w-24 bg-corpoelec-red/5 text-corpoelec-red">No Sirve</th>
                  <th className="px-4 py-4 text-center w-24 bg-bg-main/5 text-txt-muted">Cantidad</th>
                  <th className="px-6 py-4">Observaciones Técnicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {vInfo.accessoryChecks?.length > 0 ? (
                  vInfo.accessoryChecks.map((check, index) => {
                    let buenos = check.status ? 1 : 0;
                    let malos = check.status ? 0 : 1;
                    let noExisten = 0;
                    let commentText = "";

                    if (check.observations && check.observations.includes("|")) {
                      const parts = check.observations.split("|");
                      parts.forEach(part => {
                        const [key, val] = part.split(":");
                        if (key === "B") buenos = parseInt(val) || 0;
                        else if (key === "M") malos = parseInt(val) || 0;
                        else if (key === "NE") noExisten = parseInt(val) || 0;
                        else if (key === "Obs") commentText = val || "";
                      });
                    } else {
                      commentText = check.observations || "";
                      if (!check.status) {
                        malos = 1;
                        buenos = 0;
                      } else {
                        buenos = 1;
                        malos = 0;
                      }
                    }

                    const exists = noExisten === 0;

                    return (
                      <tr key={check.id} className="hover:bg-bg-main/5 transition-colors">
                        <td className="px-6 py-4 text-center text-xs font-mono font-bold text-txt-muted">
                          {(index + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-txt-main uppercase tracking-tight leading-tight">{check.accessory?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {exists ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                              SÍ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-corpoelec-red bg-corpoelec-red/10 px-2.5 py-0.5 rounded-full border border-corpoelec-red/20 text-[9px] font-black uppercase tracking-wider">
                              NO
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-4 text-center text-xs font-black text-emerald-500 bg-emerald-500/5 ${!exists ? "opacity-25" : ""}`}>
                          {exists ? buenos : 0}
                        </td>
                        <td className={`px-4 py-4 text-center text-xs font-black text-corpoelec-red bg-corpoelec-red/5 ${!exists ? "opacity-25" : ""}`}>
                          {exists ? malos : 0}
                        </td>
                        <td className={`px-4 py-4 text-center text-xs font-black text-txt-main bg-bg-main/5 ${!exists ? "opacity-25" : ""}`}>
                          {exists ? (buenos + malos) : 0}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-txt-muted italic uppercase font-semibold">
                            {commentText || (exists ? "Sin observaciones específicas." : "NO EXISTE EN LA UNIDAD")}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-txt-muted italic text-sm">
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
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <AlertCircle size={16} className="text-txt-muted" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-widest">Conclusiones del Reporte</h4>
        </div>
        <div className="bg-bg-main/5 border border-border-main p-5 rounded-2xl">
           <p className="text-txt-sub text-xs leading-relaxed italic uppercase font-semibold">
             {inspection.observations || "El auditor no ha registrado hallazgos adicionales en la sección de conclusiones generales de este reporte."}
           </p>
        </div>
      </div>

      {/* REGISTRO FOTOGRÁFICO */}
      {inspection.images && inspection.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-main">
            <Camera size={16} className="text-purple-500" />
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-widest">Registro Fotográfico</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {inspection.images.map((img) => (
              <a
                key={img.id}
                href={`${window.BACKEND_URL || "http://localhost:3000"}${img.imageUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-2xl overflow-hidden border border-border-main bg-bg-main group block"
              >
                <img
                  src={`${window.BACKEND_URL || "http://localhost:3000"}${img.imageUrl}`}
                  alt="Inspección"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Ver imagen</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
