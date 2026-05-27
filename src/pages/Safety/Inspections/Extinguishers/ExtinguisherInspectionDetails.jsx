import { useState, useEffect } from "react";
import { 
  Loader2, 
  Calendar, 
  User, 
  MapPin, 
  Shield, 
  AlertCircle,
  Hash,
  Settings,
  Building2,
  Info,
  Check,
  X,
  FileText,
  Download
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function ExtinguisherInspectionDetails({ inspectionId }) {
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
        console.error("Error fetching extinguisher inspection details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (inspectionId) fetchDetails();
  }, [inspectionId]);

  // Legacy generalObservations parser helper
  const parseGeneralObservations = (str) => {
    const data = {
      locationOk: true,
      signageOk: true,
      demarcationOk: true,
      operationOk: true,
      accessOk: true,
      impulseType: "DIRECTO",
      physicalArea: "No especificada",
      observationsText: ""
    };
    
    if (!str || !str.startsWith("CHECKLIST:")) {
      data.observationsText = str || "";
      return data;
    }

    try {
      const parts = str.split(". ");
      const checklistPart = parts[0] || "";
      const impulsePart = parts[1] || "";
      const areaPart = parts[2] || "";
      const obsPart = parts[3] || "";
      
      data.locationOk = checklistPart.includes("Ubicacion=OK");
      data.signageOk = checklistPart.includes("Señalizacion=OK");
      data.demarcationOk = checklistPart.includes("Demarcacion=OK");
      data.accessOk = checklistPart.includes("Acceso=OK");
      data.operationOk = checklistPart.includes("Funcionamiento=OK");
      
      if (impulsePart.includes("Impulsor: ")) {
        data.impulseType = impulsePart.replace("Impulsor: ", "");
      }
      if (areaPart.includes("Area: ")) {
        data.physicalArea = areaPart.replace("Area: ", "");
      }
      if (obsPart.includes("Observaciones: ")) {
        data.observationsText = obsPart.replace("Observaciones: ", "");
      }
    } catch (e) {
      data.observationsText = str;
    }
    return data;
  };

  // Compressed detail observations parser helper
  const parseDetailObservations = (observationsStr, extinguisherNumber) => {
    const data = {
      code: `EXT-${String(extinguisherNumber).padStart(3, '0')}`,
      physicalArea: "No especificada",
      impulseType: "DIRECTO",
      locationOk: true,
      signageOk: true,
      demarcationOk: true,
      accessOk: true,
      operationOk: true,
      maintenancePart: "",
      observationsText: ""
    };

    if (!observationsStr) return data;

    if (!observationsStr.includes("|")) {
      if (observationsStr.startsWith("Mantenimiento: ")) {
        data.maintenancePart = observationsStr.replace("Mantenimiento: ", "");
      } else {
        data.observationsText = observationsStr;
      }
      return data;
    }

    try {
      const parts = observationsStr.split("|");
      parts.forEach(part => {
        const [key, value] = part.split(":");
        if (!key || !value) return;
        const cleanKey = key.trim();
        const cleanValue = value.trim();

        if (cleanKey === "Code") data.code = cleanValue;
        else if (cleanKey === "Area") data.physicalArea = cleanValue;
        else if (cleanKey === "Imp") data.impulseType = cleanValue.toUpperCase();
        else if (cleanKey === "Obs") data.observationsText = cleanValue;
        else if (cleanKey === "Maint") data.maintenancePart = cleanValue;
        else if (cleanKey === "CK") {
          const checks = cleanValue.split(",");
          if (checks.length === 5) {
            data.locationOk = checks[0] === "1";
            data.signageOk = checks[1] === "1";
            data.demarcationOk = checks[2] === "1";
            data.accessOk = checks[3] === "1";
            data.operationOk = checks[4] === "1";
          }
        }
      });
    } catch (err) {
      console.error("Error parsing detail observations:", err);
    }
    return data;
  };

  // Combines legacy and new data seamlessly
  const getExtinguisherData = (detail, extInsp) => {
    if (detail && (!detail.observations || !detail.observations.includes("|"))) {
      const parsed = parseGeneralObservations(extInsp.generalObservations);
      return {
        code: extInsp.extinguisherCode || `EXT-${String(detail.extinguisherNumber || 1).padStart(3, '0')}`,
        physicalArea: parsed.physicalArea || "No especificada",
        impulseType: parsed.impulseType || "DIRECTO",
        locationOk: parsed.locationOk,
        signageOk: parsed.signageOk,
        demarcationOk: parsed.demarcationOk,
        accessOk: parsed.accessOk,
        operationOk: parsed.operationOk,
        maintenancePart: detail.observations?.startsWith("Mantenimiento: ") 
          ? detail.observations.replace("Mantenimiento: ", "").toUpperCase() 
          : "",
        observationsText: parsed.observationsText || ""
      };
    }
    return parseDetailObservations(detail?.observations, detail?.extinguisherNumber);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Recuperando reporte técnico de extintor...</p>
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

  const extInsp = inspection.extinguisherInspection || {};
  const detailsList = extInsp.details || [];

  return (
    <div className="space-y-8 pb-4 text-txt-main">

      {/* TOP HEADER WITH EXPORT BUTTON */}
      <div className="flex justify-between items-center bg-bg-main/30 p-4 rounded-2xl border border-border-main">
        <div>
          <h3 className="text-xs font-black text-txt-main uppercase tracking-widest">Reporte Técnico (Cilindros)</h3>
          <p className="text-[9px] text-txt-muted font-bold uppercase tracking-wider mt-0.5">Inspección de Extintores contra Incendios</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-bg-main/40 border border-border-main p-5 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-txt-muted tracking-widest block mb-2">Estado del Reporte</span>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
            inspection.statusId === 3 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            inspection.statusId === 2 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            "bg-txt-muted/10 text-txt-muted border-border-main"
          }`}>
            <Shield size={12} />
            {inspection.status?.name || "Procesado"}
          </div>
        </div>
        
        <div className="bg-bg-main/40 border border-border-main p-5 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue">
              <Calendar size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">Fecha de Auditoría</span>
              <p className="text-sm font-bold text-txt-main">{new Date(inspection.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
           </div>
        </div>

        <div className="bg-bg-main/40 border border-border-main p-5 rounded-2xl flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue">
              <Hash size={20} />
           </div>
           <div>
              <span className="text-[9px] font-bold text-txt-muted uppercase tracking-tighter">N° de Inspección / Reporte</span>
              <p className="text-sm font-mono font-bold text-corpoelec-blue">
                {inspection.inspectionNumber || `#${inspection.id.toString().padStart(6, '0')}`}
              </p>
           </div>
        </div>
      </div>

      {/* INSPECTOR & WORK CENTER CARD */}
      <div className="bg-bg-main/20 border border-border-main/60 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-bg-surface p-3 px-4 rounded-2xl border border-border-main shadow-sm flex-1 sm:flex-initial">
            <div className="w-9 h-9 rounded-full bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue">
              <User size={16} />
            </div>
            <div>
              <span className="text-[9px] text-txt-muted uppercase font-bold block leading-none mb-1">Inspector Responsable</span>
              <span className="text-xs font-bold text-txt-sub">{inspection.inspector?.firstName} {inspection.inspector?.lastName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-bg-surface p-3 px-4 rounded-2xl border border-border-main shadow-sm flex-1 sm:flex-initial">
            <div className="w-9 h-9 rounded-full bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue">
              <Building2 size={16} />
            </div>
            <div>
              <span className="text-[9px] text-txt-muted uppercase font-bold block leading-none mb-1">Sede / Instalación</span>
              <span className="text-xs font-bold text-txt-sub">{inspection.facility?.name}</span>
            </div>
          </div>
        </div>

        {inspection.observations && (
          <div className="bg-bg-surface border border-border-main p-4 rounded-2xl max-w-md w-full md:w-auto shadow-sm italic flex items-start gap-2.5">
            <Info size={15} className="text-txt-muted shrink-0 mt-0.5" />
            <p className="text-[11px] text-txt-sub leading-normal">
              <strong>Obs. Auditoría:</strong> {inspection.observations}
            </p>
          </div>
        )}
      </div>

      {/* EXTINGUISHERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Shield size={18} className="text-corpoelec-blue" />
          <h4 className="text-xs font-black uppercase text-txt-muted tracking-widest">
            Detalle de Extintores Inspeccionados ({detailsList.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {detailsList.map((detail, idx) => {
            const parsed = getExtinguisherData(detail, extInsp);
            const isLegacy = !detail.observations || !detail.observations.includes("|");

            const checkBadge = (val, label) => (
              <div className="flex items-center justify-between p-2.5 px-3 bg-bg-main/5 border border-border-main/50 rounded-xl">
                <span className="text-[10px] font-bold text-txt-sub">{label}</span>
                {val ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Check size={10} />
                    BUENO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-corpoelec-red bg-corpoelec-red/10 px-2 py-0.5 rounded border border-corpoelec-red/20">
                    <X size={10} />
                    FALLA
                  </span>
                )}
              </div>
            );

            return (
              <div 
                key={detail.id || idx}
                className="bg-bg-surface border border-border-main rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-corpoelec-blue/20 transition-all flex flex-col gap-6"
              >
                
                {/* Extinguisher Top Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-main/40">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-corpoelec-blue tracking-tighter uppercase">{parsed.code}</span>
                    <span className="px-3 py-1 bg-bg-main border border-border-main text-[10px] font-black uppercase text-txt-sub rounded-lg">
                      {detail.agentType?.name || "Extintor"} - {detail.capacity || "10 Lb"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-txt-muted uppercase tracking-wider mr-1">Operatividad:</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      detail.generalStatus === "OPERATIVO" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      detail.generalStatus === "MANTENIMIENTO" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>{detail.generalStatus}</span>
                  </div>
                </div>

                {/* Card Sub-grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Tech Data */}
                  <div className="space-y-4 bg-bg-main/5 p-5 rounded-2xl border border-border-main/40">
                    <h5 className="text-[9px] font-black text-txt-muted uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                      <Settings size={12} className="text-corpoelec-blue" />
                      Especificaciones Técnicas
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-txt-muted uppercase block leading-none mb-1">Área Ubicado</span>
                        <span className="font-bold text-txt-main">{parsed.physicalArea === "OTRA" ? parsed.physicalAreaOther : parsed.physicalArea}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-txt-muted uppercase block leading-none mb-1">Agente Impulsor</span>
                        <span className="font-bold text-txt-main uppercase">{parsed.impulseType}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-txt-muted uppercase block leading-none mb-1">Fecha Recarga</span>
                        <span className="font-semibold text-txt-sub">
                          {detail.rechargeDate ? new Date(detail.rechargeDate).toLocaleDateString() : "N/R"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-txt-muted uppercase block leading-none mb-1">Vencimiento</span>
                        <span className="font-semibold text-txt-sub">
                          {detail.expirationDate ? new Date(detail.expirationDate).toLocaleDateString() : "N/R"}
                        </span>
                      </div>
                    </div>

                    {parsed.maintenancePart && (
                      <div className="border-t border-border-main/50 pt-3 mt-1 text-xs">
                        <span className="text-[9px] font-bold text-corpoelec-red uppercase block leading-none mb-1">Repuesto / Parte en Falla</span>
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-corpoelec-red bg-corpoelec-red/5 px-3 py-1 rounded-lg border border-corpoelec-red/10 uppercase">
                          <AlertCircle size={10} />
                          {parsed.maintenancePart}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Visual Checklist */}
                  <div className="space-y-2">
                    <h5 className="text-[9px] font-black text-txt-muted uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                      <Shield size={12} className="text-corpoelec-blue" />
                      Chequeo Visual del Puesto
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {checkBadge(parsed.locationOk, "Ubicación Correcta")}
                      {checkBadge(parsed.signageOk, "Señalización Visible")}
                      {checkBadge(parsed.demarcationOk, "Área Demarcada")}
                      {checkBadge(parsed.accessOk, "Acceso Despejado")}
                      <div className="sm:col-span-2">
                        {checkBadge(parsed.operationOk, "Manómetro / Precinto")}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Specific Cylinder observations */}
                {parsed.observationsText && (
                  <div className="bg-bg-main/5 border border-border-main/40 p-4 rounded-2xl flex items-start gap-2 text-xs italic">
                    <Info size={14} className="text-txt-muted shrink-0 mt-0.5" />
                    <p className="text-[11px] text-txt-sub leading-normal">
                      <strong>Obs. del Cilindro:</strong> {parsed.observationsText}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
