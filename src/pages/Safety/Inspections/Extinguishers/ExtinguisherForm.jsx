import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Shield, 
  AlertCircle,
  Settings,
  Hash,
  Loader2,
  User,
  Info,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileText
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function ExtinguisherForm({ onCancel, onSuccess, initialData, inspectionsList = [] }) {
  const api = helpFetch();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    facilityId: "",
    inspectorId: "",
    statusId: 1, // Global inspection status
    inspectionNumber: "", // Generated dynamically right before submission if creating
    observations: "", // General observations in base Inspection
    extinguishers: [] // List of inspected extinguishers
  });

  const [lookups, setLookups] = useState({
    facilities: [],
    inspectors: [],
    statuses: [],
    agentTypes: []
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-form state for individual extinguisher addition/edition
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingExtIndex, setEditingExtIndex] = useState(null); // null if adding, integer index if editing
  const [extForm, setExtForm] = useState({
    code: "",
    physicalArea: "",
    agentTypeId: "",
    impulseType: "directo", // directo | indirecto
    capacity: "10 Lb",
    lastRechargeDate: "",
    expirationDate: "",
    generalStatus: "OPERATIVO", // OPERATIVO | MANTENIMIENTO | FUERA DE SERVICIO
    locationOk: true,
    signageOk: true,
    demarcationOk: true,
    operationOk: true,
    accessOk: true,
    maintenancePart: "",
    observations: ""
  });

  // Legacy parser helper (generalObservations parsing)
  const parseGeneralObservations = (str) => {
    const data = {
      locationOk: true,
      signageOk: true,
      demarcationOk: true,
      operationOk: true,
      accessOk: true,
      impulseType: "directo",
      physicalArea: "",
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
        data.impulseType = impulsePart.replace("Impulsor: ", "").toLowerCase();
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

  // Compressed parser for individual extinguishers
  const parseDetailObservations = (observationsStr, extinguisherNumber) => {
    const data = {
      code: `EXT-${String(extinguisherNumber).padStart(3, '0')}`,
      physicalArea: "",
      impulseType: "directo",
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
        data.maintenancePart = observationsStr.replace("Mantenimiento: ", "").toLowerCase();
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
        else if (cleanKey === "Imp") data.impulseType = cleanValue.toLowerCase();
        else if (cleanKey === "Obs") data.observationsText = cleanValue;
        else if (cleanKey === "Maint") data.maintenancePart = cleanValue.toLowerCase();
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

  // Recover helper combining legacy and new formats
  const getExtinguisherData = (detail, extInsp) => {
    if (detail && (!detail.observations || !detail.observations.includes("|"))) {
      const parsed = parseGeneralObservations(extInsp.generalObservations);
      return {
        code: extInsp.extinguisherCode || `EXT-${String(detail.extinguisherNumber || 1).padStart(3, '0')}`,
        physicalArea: parsed.physicalArea || "Área General",
        impulseType: parsed.impulseType || "directo",
        locationOk: parsed.locationOk,
        signageOk: parsed.signageOk,
        demarcationOk: parsed.demarcationOk,
        accessOk: parsed.accessOk,
        operationOk: parsed.operationOk,
        maintenancePart: detail.observations?.startsWith("Mantenimiento: ") 
          ? detail.observations.replace("Mantenimiento: ", "").toLowerCase() 
          : "",
        observationsText: parsed.observationsText || ""
      };
    }
    return parseDetailObservations(detail?.observations, detail?.extinguisherNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, empRes, statRes, agentRes] = await Promise.all([
          api.get("/facilities"),
          api.get("/employees"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/agent-types")
        ]);

        setLookups({
          facilities: facRes || [],
          inspectors: empRes || [],
          statuses: statRes || [],
          agentTypes: agentRes || []
        });

        let defaultAgentTypeId = agentRes && agentRes.length > 0 ? agentRes[0].id : "";

        if (initialData) {
          const extInsp = initialData.extinguisherInspection || {};
          const detailsList = extInsp.details || [];
          
          // Map all details to the extinguishers array
          const loadedExtinguishers = detailsList.map((detail, idx) => {
            const parsed = getExtinguisherData(detail, extInsp);
            return {
              id: detail.id || idx,
              code: parsed.code,
              physicalArea: parsed.physicalArea,
              agentTypeId: detail.agentTypeId || defaultAgentTypeId,
              impulseType: parsed.impulseType || "directo",
              capacity: detail.capacity || "10 Lb",
              lastRechargeDate: detail.rechargeDate || "",
              expirationDate: detail.expirationDate || "",
              generalStatus: detail.generalStatus || "OPERATIVO",
              locationOk: parsed.locationOk,
              signageOk: parsed.signageOk,
              demarcationOk: parsed.demarcationOk,
              accessOk: parsed.accessOk,
              operationOk: parsed.operationOk,
              maintenancePart: parsed.maintenancePart || "",
              observations: parsed.observationsText || ""
            };
          });

          setFormData({
            date: initialData.date || new Date().toISOString().split('T')[0],
            facilityId: initialData.facilityId || "",
            inspectorId: initialData.employeePersonalNumber || "",
            statusId: initialData.statusId || 1,
            inspectionNumber: initialData.inspectionNumber || "",
            observations: initialData.observations || "",
            extinguishers: loadedExtinguishers
          });
        }
      } catch (error) {
        showNotification("Error al cargar datos del formulario", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExtFormChange = (e) => {
    const { name, value } = e.target;

    // Automatically set expiration date to 1 year after recharge date
    if (name === "lastRechargeDate" && value) {
      const rechargeDateObj = new Date(value);
      if (!isNaN(rechargeDateObj.getTime())) {
        rechargeDateObj.setFullYear(rechargeDateObj.getFullYear() + 1);
        const expDate = rechargeDateObj.toISOString().split("T")[0];
        setExtForm(prev => ({
          ...prev,
          lastRechargeDate: value,
          expirationDate: expDate
        }));
        return;
      }
    }

    setExtForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sub-form actions
  const handleOpenAddExt = () => {
    let defaultAgentTypeId = lookups.agentTypes && lookups.agentTypes.length > 0 ? lookups.agentTypes[0].id : "";
    setExtForm({
      code: `EXT-${String(formData.extinguishers.length + 1).padStart(3, '0')}`,
      physicalArea: "",
      agentTypeId: defaultAgentTypeId,
      impulseType: "directo",
      capacity: "10 Lb",
      lastRechargeDate: "",
      expirationDate: "",
      generalStatus: "OPERATIVO",
      locationOk: true,
      signageOk: true,
      demarcationOk: true,
      accessOk: true,
      operationOk: true,
      maintenancePart: "",
      observations: ""
    });
    setEditingExtIndex(null);
    setShowSubForm(true);
  };

  const handleOpenEditExt = (index) => {
    setExtForm({ ...formData.extinguishers[index] });
    setEditingExtIndex(index);
    setShowSubForm(true);
  };

  const handleRemoveExt = (index) => {
    setFormData(prev => ({
      ...prev,
      extinguishers: prev.extinguishers.filter((_, idx) => idx !== index)
    }));
    showNotification("Extintor removido de la lista", "info");
  };

  const handleSaveExt = () => {
    if (!extForm.code.trim()) {
      showNotification("El código del extintor es obligatorio", "error");
      return;
    }
    if (!extForm.physicalArea.trim()) {
      showNotification("El área física es obligatoria", "error");
      return;
    }
    if (!extForm.lastRechargeDate) {
      showNotification("La fecha de última recarga es obligatoria", "error");
      return;
    }

    setFormData(prev => {
      const newList = [...prev.extinguishers];
      if (editingExtIndex !== null) {
        newList[editingExtIndex] = extForm;
      } else {
        newList.push(extForm);
      }
      return {
        ...prev,
        extinguishers: newList
      };
    });

    setShowSubForm(false);
    showNotification(
      editingExtIndex !== null ? "Extintor actualizado en la lista" : "Extintor agregado a la lista",
      "success"
    );
  };

  // Compressed pipeline serializer to safely store detailed attributes in STRING(100)
  const serializeDetailObservations = (ext) => {
    const ck = `${ext.locationOk ? "1" : "0"},${ext.signageOk ? "1" : "0"},${ext.demarcationOk ? "1" : "0"},${ext.accessOk ? "1" : "0"},${ext.operationOk ? "1" : "0"}`;
    // Limit specific observation notes to 30 characters to keep it well under 100 limit
    const obsSafe = (ext.observations || "").replace(/[|:]/g, "").slice(0, 30);
    const areaSafe = (ext.physicalArea || "").replace(/[|:]/g, "").slice(0, 20);
    const maintSafe = (ext.maintenancePart || "").replace(/[|:]/g, "");

    return `Code:${ext.code.toUpperCase()}|Area:${areaSafe}|Imp:${ext.impulseType.toUpperCase()}|CK:${ck}|Maint:${maintSafe.toUpperCase()}|Obs:${obsSafe}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.extinguishers.length === 0) {
      showNotification("Debe agregar al menos un extintor a la lista de inspección", "error");
      return;
    }

    setIsSubmitting(true);

    // Generate inspection report number
    let finalInspectionNumber = formData.inspectionNumber;
    if (!initialData?.id) {
      const year = formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear();
      const firstExtCode = formData.extinguishers[0].code.trim().toUpperCase();
      let nextSeq = 1;
      
      if (firstExtCode) {
        const matchingInsps = (inspectionsList || []).filter(
          i => i.extinguisherInspection?.extinguisherCode?.trim().toUpperCase() === firstExtCode
        );
        nextSeq = matchingInsps.length + 1;
      }
      finalInspectionNumber = `EXT-${year}-${firstExtCode}-${nextSeq}`;
    }

    const payload = {
      date: formData.date,
      facilityId: parseInt(formData.facilityId),
      inspectorId: formData.inspectorId,
      statusId: parseInt(formData.statusId),
      inspectionNumber: finalInspectionNumber,
      observations: formData.observations,
      type: "Extintor",
      extinguisherData: {
        extinguisherCode: formData.extinguishers[0]?.code.toUpperCase() || "MULTIPLE",
        inspectionDate: formData.date,
        responsiblePersonalNumber: formData.inspectorId,
        generalObservations: `Inspección de ${formData.extinguishers.length} extintores en la instalación.`,
        details: formData.extinguishers.map((ext, idx) => ({
          agentTypeId: parseInt(ext.agentTypeId),
          extinguisherNumber: parseInt(ext.code.replace(/\D/g, '')) || (idx + 1),
          capacity: ext.capacity,
          rechargeDate: ext.lastRechargeDate,
          expirationDate: ext.expirationDate || null,
          generalStatus: ext.generalStatus,
          observations: serializeDetailObservations(ext)
        }))
      }
    };

    const isEditing = !!initialData?.id;
    const url = isEditing ? `/inspections/${initialData.id}` : "/inspections";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await api[method.toLowerCase()](url, { body: payload });

      if (res && !res.err) {
        showNotification(
          isEditing ? "Auditoría de extintores actualizada correctamente" : "Auditoría de extintores guardada correctamente", 
          "success"
        );
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(res.statusText || "Error al registrar auditoría", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ChecklistItem = ({ label, field }) => (
    <div className="flex items-center justify-between p-4 bg-bg-main/5 rounded-2xl border border-border-main/40 hover:border-corpoelec-blue/30 transition-colors">
      <span className="text-xs font-bold text-txt-main">{label}</span>
      <div className="flex bg-bg-surface rounded-xl p-1 border border-border-main">
        <button
          type="button"
          onClick={() => setExtForm(prev => ({ ...prev, [field]: true }))}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
            extForm[field] ? "bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/15" : "text-txt-muted hover:text-txt-main"
          }`}
        >
          Bueno
        </button>
        <button
          type="button"
          onClick={() => setExtForm(prev => ({ ...prev, [field]: false }))}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
            !extForm[field] ? "bg-corpoelec-red text-white shadow-md shadow-corpoelec-red/15" : "text-txt-muted hover:text-txt-main"
          }`}
        >
          Malo
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="animate-spin text-corpoelec-blue" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">Sincronizando ficha técnica...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SUB-FORMULARIO INLINE (MODAL OVERLAY) PARA AGREGAR/EDITAR UN EXTINTOR */}
      {showSubForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-bg-surface w-full max-w-3xl rounded-[2.5rem] border border-border-main shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-border-main bg-bg-main/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings className="text-corpoelec-blue" size={18} />
                <h4 className="text-xs font-black uppercase text-txt-main tracking-widest">
                  {editingExtIndex !== null ? "Editar Ficha de Extintor" : "Agregar Ficha de Extintor"}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSubForm(false)}
                className="h-8 w-8 hover:bg-bg-main rounded-full flex items-center justify-center text-txt-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 no-scrollbar flex-1">
              
              {/* FICHA TÉCNICA */}
              <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
                <h5 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] pb-1 border-b border-border-main/30">1. Características Técnicas</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Código Extintor *</label>
                    <input 
                      type="text" name="code" required value={extForm.code} onChange={handleExtFormChange} 
                      className="input-field h-11 font-bold text-corpoelec-blue border border-border-main" placeholder="Ej: EXT-005" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Área Ubicación *</label>
                    <input 
                      type="text" name="physicalArea" required value={extForm.physicalArea} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main" placeholder="Ej: Pasillo Admin" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Agente Extinguidor *</label>
                    <select 
                      name="agentTypeId" required value={extForm.agentTypeId} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main"
                    >
                      {lookups.agentTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Capacidad *</label>
                    <input 
                      type="text" name="capacity" required value={extForm.capacity} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main" placeholder="Ej: 10 Lb / 5 Kg" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Última Recarga *</label>
                    <input 
                      type="date" name="lastRechargeDate" required value={extForm.lastRechargeDate} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Próximo Vencimiento</label>
                    <input 
                      type="date" name="expirationDate" value={extForm.expirationDate} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main bg-bg-surface border-dashed" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Agente Impulsor</label>
                    <div className="flex bg-bg-surface p-1 rounded-xl border border-border-main h-11">
                      <button
                        type="button"
                        onClick={() => setExtForm(prev => ({ ...prev, impulseType: 'directo' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${extForm.impulseType === 'directo' ? 'bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/15' : 'text-txt-muted hover:text-txt-main'}`}
                      >
                        Directo
                      </button>
                      <button
                        type="button"
                        onClick={() => setExtForm(prev => ({ ...prev, impulseType: 'indirecto' }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${extForm.impulseType === 'indirecto' ? 'bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/15' : 'text-txt-muted hover:text-txt-main'}`}
                      >
                        Indirecto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTA DE COMPROBACIÓN VISUAL */}
              <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
                <h5 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] pb-1 border-b border-border-main/30">2. Inspección Visual del Puesto</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ChecklistItem label="Ubicación Correcta" field="locationOk" />
                  <ChecklistItem label="Señalización Visible" field="signageOk" />
                  <ChecklistItem label="Área Demarcada" field="demarcationOk" />
                  <ChecklistItem label="Acceso Libre de Obstrucciones" field="accessOk" />
                  <div className="sm:col-span-2">
                    <ChecklistItem label="Funcionamiento de Manómetro / Precinto de Seguridad" field="operationOk" />
                  </div>
                </div>
              </div>

              {/* NOVEDADES Y ESTADO */}
              <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
                <h5 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] pb-1 border-b border-border-main/30">3. Novedades y Operatividad</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Estado de Operatividad *</label>
                    <select 
                      name="generalStatus" required value={extForm.generalStatus} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main font-black"
                    >
                      <option value="OPERATIVO">OPERATIVO</option>
                      <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                      <option value="FUERA DE SERVICIO">FUERA DE SERVICIO</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Parte que requiere mantenimiento</label>
                    <select 
                      name="maintenancePart" value={extForm.maintenancePart} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main"
                    >
                      <option value="">Ninguna - Todo Correcto</option>
                      <option value="manguera">Manguera de Descarga</option>
                      <option value="corneta">Corneta / Boquilla</option>
                      <option value="manometro">Manómetro (Baja/Alta Presión)</option>
                      <option value="precinto">Precinto de Seguridad (Faltante/Roto)</option>
                      <option value="cilindro">Cilindro (Oxidación/Golpe)</option>
                      <option value="valvula">Válvula / Gatillo de Accionamiento</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Comentarios Específicos (Máx. 30 caracteres)</label>
                    <input 
                      type="text" name="observations" maxLength={30} value={extForm.observations} onChange={handleExtFormChange} 
                      className="input-field h-11 border border-border-main placeholder:text-txt-muted/30" placeholder="Escriba notas del cilindro..." 
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-border-main bg-bg-main/5 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowSubForm(false)}
                className="px-6 py-2.5 rounded-xl border border-border-main text-[10px] font-black uppercase text-txt-muted hover:text-txt-main transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleSaveExt}
                className="px-6 py-2.5 rounded-xl bg-corpoelec-blue text-white text-[10px] font-black uppercase shadow-lg shadow-corpoelec-blue/15 hover:bg-corpoelec-blue/90 transition-all"
              >
                {editingExtIndex !== null ? "Actualizar Extintor" : "Agregar Extintor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO GENERAL */}
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 no-scrollbar">
        
        {/* SECCIÓN 1: DATOS GENERALES DE AUDITORÍA */}
        <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-main/50">
            <MapPin size={16} className="text-corpoelec-blue" />
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Localización e Inspector</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Fecha de Auditoría *</label>
              <input 
                type="date" name="date" required value={formData.date} onChange={handleChange} 
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Centro de Trabajo / Sede *</label>
              <select 
                name="facilityId" required value={formData.facilityId} onChange={handleChange} 
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue"
              >
                <option value="">Seleccione sede...</option>
                {lookups.facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Inspector Responsable *</label>
              <select 
                name="inspectorId" required value={formData.inspectorId} onChange={handleChange} 
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue"
              >
                <option value="">Seleccione inspector...</option>
                {lookups.inspectors.map(e => (
                  <option key={e.personalNumber} value={e.personalNumber}>{e.firstName} {e.lastName} ({e.personalNumber})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Resultado de Inspección General *</label>
              <select 
                name="statusId" required value={formData.statusId} onChange={handleChange} 
                className="input-field h-12 font-black border border-border-main focus:border-corpoelec-blue"
              >
                {lookups.statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Observaciones Generales de la Auditoría</label>
            <textarea 
              name="observations" rows="2" value={formData.observations} onChange={handleChange} 
              className="input-field py-3 resize-none min-h-[70px] border border-border-main placeholder:text-txt-muted/30" placeholder="Escriba comentarios sobre el estado de la sede..." 
            />
          </div>
        </div>

        {/* SECCIÓN 2: INVENTARIO DE EXTINTORES EVALUADOS */}
        <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border-main/50">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-corpoelec-blue" />
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Equipos Evaluados ({formData.extinguishers.length})</h4>
            </div>
            <button
              type="button"
              onClick={handleOpenAddExt}
              className="px-4 py-2 border border-corpoelec-blue/30 bg-corpoelec-blue/5 hover:bg-corpoelec-blue/10 rounded-xl text-[10px] font-black uppercase text-corpoelec-blue transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              Vincular Extintor
            </button>
          </div>

          {formData.extinguishers.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-border-main/60 rounded-[2rem] text-center bg-bg-main/5 flex flex-col items-center">
              <div className="h-16 w-16 bg-bg-surface border border-border-main rounded-2xl flex items-center justify-center mb-4 shadow-sm text-txt-muted/30">
                <Settings size={28} />
              </div>
              <p className="text-txt-muted font-black uppercase tracking-widest text-[9px]">No hay extintores agregados a este reporte.</p>
              <p className="text-txt-muted/50 text-[8px] font-bold mt-1.5 uppercase">Presione "+ Vincular Extintor" para evaluar un equipo en las instalaciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.extinguishers.map((ext, index) => {
                const agentName = lookups.agentTypes.find(a => String(a.id) === String(ext.agentTypeId))?.name || "Extintor";
                return (
                  <div
                    key={index}
                    className="flex flex-col p-5 bg-bg-surface border border-border-main rounded-3xl shadow-sm hover:shadow-md hover:border-corpoelec-blue/30 transition-all relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-lg font-black text-txt-main tracking-tight uppercase">{ext.code}</span>
                        <p className="text-[9px] font-black text-corpoelec-blue uppercase mt-0.5 tracking-wider bg-corpoelec-blue/5 px-2 py-0.5 rounded-md border border-corpoelec-blue/10 w-fit">
                          {agentName} - {ext.capacity}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditExt(index)}
                          className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                          title="Editar Ficha"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExt(index)}
                          className="p-2 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-all"
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-border-main/50 pt-3 text-[10px] font-bold text-txt-sub">
                      <div className="flex justify-between">
                        <span className="text-txt-muted font-black uppercase text-[8px] tracking-wider">Ubicación física:</span>
                        <span className="font-semibold text-txt-main">{ext.physicalArea}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-txt-muted font-black uppercase text-[8px] tracking-wider">Recarga / Venc.:</span>
                        <span>{ext.lastRechargeDate} a {ext.expirationDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-txt-muted font-black uppercase text-[8px] tracking-wider">Estado Operativo:</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                          ext.generalStatus === "OPERATIVO" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          ext.generalStatus === "MANTENIMIENTO" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                          "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>{ext.generalStatus}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-6 pb-2 border-t border-border-main flex justify-end gap-3 bg-bg-surface">
          <button 
            type="button" onClick={onCancel} 
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" disabled={isSubmitting} 
            className="btn-primary cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : "Guardar Auditoría de Extintores"}
          </button>
        </div>

      </form>

    </div>
  );
}
