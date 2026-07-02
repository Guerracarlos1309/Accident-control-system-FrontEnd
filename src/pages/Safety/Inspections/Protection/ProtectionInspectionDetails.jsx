import { useState, useEffect } from "react";
import { 
  Loader2, 
  Calendar, 
  User, 
  MapPin, 
  Shield, 
  AlertCircle,
  Hash,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle,
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

export default function ProtectionInspectionDetails({ inspectionId }) {
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
        console.error("Error fetching protection equipment inspection details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (inspectionId) fetchDetails();
  }, [inspectionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Recuperando reporte de equipos de protección...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-center py-20 text-txt-muted">
        <AlertCircle size={40} className="mx-auto mb-4 opacity-20 text-corpoelec-red" />
        <p className="text-sm font-bold uppercase tracking-widest">No se pudo cargar la información del reporte.</p>
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

  const protInsp = inspection.protectionInspection || {};
  const detailsList = protInsp.details || [];

  // Sort details by category ID so they follow the CORPOELEC sheet order (1 to 38)
  detailsList.sort((a, b) => (a.categoryId || 0) - (b.categoryId || 0));

  return (
    <div className="space-y-8 pb-4 text-txt-main">

      {/* TOP HEADER WITH EXPORT BUTTON */}
      <div className="flex justify-between items-center bg-bg-main/30 p-4 rounded-2xl border border-border-main">
        <div>
          <h3 className="text-xs font-black text-txt-main uppercase tracking-widest">Reporte de Lote (EPI)</h3>
          <p className="text-[9px] text-txt-muted font-bold uppercase tracking-wider mt-0.5">Gestión de Inventario y Protección</p>
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
        <div className="bg-bg-main/30 border border-border-main p-5 rounded-3xl">
          <span className="text-[9px] font-black uppercase text-txt-muted tracking-widest block mb-2">Estado General del Lote</span>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase border ${
            inspection.statusId === 1 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            inspection.statusId === 2 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            "bg-txt-muted/10 text-txt-muted border-border-main"
          }`}>
            <Shield size={12} />
            {inspection.status?.name || "Verificado"}
          </div>
        </div>
        
        <div className="bg-bg-main/30 border border-border-main p-5 rounded-3xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue border border-corpoelec-blue/15">
              <Calendar size={18} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">Fecha de Auditoría</span>
              <p className="text-sm font-black text-txt-main">{parseLocalDate(inspection.date)?.toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
           </div>
        </div>

        <div className="bg-bg-main/30 border border-border-main p-5 rounded-3xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue border border-corpoelec-blue/15">
              <Hash size={18} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">N° Reporte de Lote (EPI)</span>
              <p className="text-sm font-mono font-bold text-corpoelec-blue uppercase">
                {inspection.inspectionNumber || `#${inspection.id.toString().padStart(6, '0')}`}
              </p>
           </div>
        </div>
      </div>

      {/* METADATA DIAGNOSTICS */}
      <div className="glass-panel border-corpoelec-blue/20 bg-corpoelec-blue/5 p-6 rounded-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 transition-transform group-hover:scale-110">
            <Layers size={120} />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4">
               <div>
                  <h4 className="text-[10px] font-black uppercase text-corpoelec-blue tracking-widest mb-1">Centro Inspeccionado</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-txt-main tracking-tighter">{inspection.facility?.name}</span>
                    <span className="px-3 py-1 bg-bg-main/30 rounded-lg text-txt-sub text-xs font-bold border border-border-main uppercase">
                       ASHO Planilla Oficial
                    </span>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-6">
                  <div>
                     <span className="text-[9px] text-txt-muted uppercase font-bold tracking-tight block">Ubicación Geográfica</span>
                     <p className="text-xs text-txt-sub font-semibold">{inspection.facility?.location?.name || "Sede Principal"}</p>
                  </div>
                  <div>
                     <span className="text-[9px] text-txt-muted uppercase font-bold tracking-tight block">Dirección Sede</span>
                     <p className="text-xs text-txt-sub font-semibold">{inspection.facility?.location?.address || "N/A"}</p>
                  </div>
                  <div>
                     <span className="text-[9px] text-purple-400 uppercase font-black tracking-tight block">Planificación</span>
                     <p className="text-xs font-bold">
                       {inspection.isScheduled ? (
                         <span className="text-purple-400">
                           PROGRAMADA ({parseLocalDate(inspection.scheduledDate)?.toLocaleDateString(undefined, { dateStyle: "short" }) || "-"})
                         </span>
                       ) : (
                         <span className="text-txt-muted">NO PROGRAMADA</span>
                       )}
                     </p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 w-full md:w-auto">
               <div className="flex items-center gap-3 bg-bg-surface p-3.5 rounded-2xl border border-border-main shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-bg-main/20 flex items-center justify-center border border-border-main">
                     <User size={16} className="text-txt-sub" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9px] text-txt-muted uppercase font-bold">Auditor / Inspector</span>
                     <span className="text-xs font-bold text-txt-sub">{inspection.inspector?.firstName} {inspection.inspector?.lastName}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* EQUIPMENT GRID */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border-main/60">
          <Layers size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Equipos y Materiales Evaluados (ASHO 2026-2027)
          </h4>
        </div>
        
        {detailsList.length === 0 ? (
          <div className="text-center py-10 bg-bg-main/5 rounded-2xl border border-border-main text-txt-muted text-xs font-bold uppercase tracking-widest">
            No hay detalles de equipos registrados en este lote.
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem] shadow-sm">
             <div className="overflow-x-auto no-scrollbar max-h-[50vh] overflow-y-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-bg-surface border-b border-border-main/50 shadow-sm">
                    <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                      <th className="px-4 py-3 text-center w-12">Nro</th>
                      <th className="px-5 py-3">Descripción del Material</th>
                      <th className="px-4 py-3 text-center w-24">Medida</th>
                      <th className="px-4 py-3 text-center w-24 bg-emerald-500/5 text-emerald-500">Buenos</th>
                      <th className="px-4 py-3 text-center w-24 bg-corpoelec-red/5 text-corpoelec-red">No Sirven</th>
                      <th className="px-4 py-3 text-center w-24 bg-corpoelec-blue/5 text-corpoelec-blue">Total</th>
                      <th className="px-5 py-3">Diagnóstico</th>
                      <th className="px-5 py-3">Observaciones Técnicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/20">
                    {detailsList.map((detail) => {
                      // Decode serialized observations: B:10|M:2|NE:3|Obs:Comment
                      let buenos = detail.operative !== undefined ? detail.operative : 0;
                      let malos = detail.totalChecked !== undefined ? (detail.totalChecked - detail.operative) : 0;
                      let noExisten = 0;
                      let commentText = "";

                      if (detail.observations && detail.observations.includes("|")) {
                        const parts = detail.observations.split("|");
                        parts.forEach(part => {
                          const [key, val] = part.split(":");
                          if (key === "B") buenos = parseInt(val) || 0;
                          else if (key === "M") malos = parseInt(val) || 0;
                          else if (key === "NE") noExisten = parseInt(val) || 0;
                          else if (key === "Obs") commentText = val || "";
                        });
                      } else {
                        commentText = detail.observations || "";
                      }

                      const isAllOk = malos === 0 && noExisten === 0 && (buenos > 0);
                      const hasIssues = malos > 0;
                      const hasMissing = noExisten > 0;

                      return (
                        <tr key={detail.id} className="hover:bg-bg-main/5 transition-colors">
                          <td className="px-4 py-3 text-center text-xs font-mono font-bold text-txt-muted">
                            {(detail.category?.id || detail.categoryId || 0).toString().padStart(2, "0")}
                          </td>
                          
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-txt-main uppercase tracking-tight leading-tight">
                                {detail.category?.name || `Material #${detail.categoryId}`}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="text-[9px] font-black uppercase text-txt-muted bg-bg-main/30 px-2 py-0.5 rounded border border-border-main/50 tracking-wider">
                              {detail.category?.description || "PIEZAS"}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center text-xs font-black text-emerald-500 bg-emerald-500/5">
                            {buenos}
                          </td>

                          <td className={`px-4 py-3 text-center text-xs font-black bg-corpoelec-red/5 ${malos > 0 ? "text-corpoelec-red font-black" : "text-txt-muted"}`}>
                            {malos}
                          </td>

                          <td className="px-4 py-3 text-center text-xs font-black text-corpoelec-blue bg-corpoelec-blue/5">
                            {buenos + malos}
                          </td>

                          <td className="px-5 py-3">
                            {isAllOk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/25 text-[8px] font-black tracking-widest uppercase">
                                <CheckCircle size={10} />
                                100% OPERATIVO
                              </span>
                            ) : (buenos === 0 && malos === 0 && noExisten === 0) ? (
                              <span className="inline-flex items-center gap-1 text-txt-muted bg-txt-muted/10 px-2.5 py-0.5 rounded-lg border border-border-main text-[8px] font-black tracking-widest uppercase">
                                SIN NOVEDAD
                              </span>
                            ) : hasIssues ? (
                              <span className="inline-flex items-center gap-1 text-corpoelec-red bg-corpoelec-red/10 px-2.5 py-0.5 rounded-lg border border-corpoelec-red/25 text-[8px] font-black tracking-widest uppercase">
                                <XCircle size={10} />
                                REQUIERE REPOSICIÓN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/25 text-[8px] font-black tracking-widest uppercase">
                                <AlertTriangle size={10} />
                                INCOMPLETO
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3 text-xs font-bold text-txt-sub uppercase italic leading-tight">
                            {commentText || "SIN NOVEDADES"}
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

      {/* DETALLE DE NOVEDADES GENERALES */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Info size={16} className="text-txt-muted" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-widest">Observaciones y Dictamen Técnico ASHO</h4>
        </div>
        <div className="bg-bg-main/5 border border-border-main p-5 rounded-2xl flex items-start shadow-sm min-h-[80px]">
           <p className="text-txt-sub text-xs leading-relaxed italic uppercase font-semibold">
             {inspection.observations || "Sin dictamen técnico general registrado por el inspector."}
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
