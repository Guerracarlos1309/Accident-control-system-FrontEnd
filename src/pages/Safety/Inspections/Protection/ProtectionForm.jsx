import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  Layers,
  Loader2,
  User,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  BookOpen,
  ClipboardCheck,
  FolderOpen,
  Camera,
  X,
  Plus,
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function ProtectionForm({
  onCancel,
  onSuccess,
  initialData,
  inspectionsList = [],
}) {
  const api = helpFetch();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    facilityId: "",
    inspectorId: "",
    statusId: 1, // Global inspection status (1 = Operativo, 2 = Con Fallas, etc.)
    inspectionNumber: "",
    observations: "",
    isScheduled: false,
    scheduledDate: "",
  });

  const [equipmentToInspect, setEquipmentToInspect] = useState([]);
  const [lookups, setLookups] = useState({
    facilities: [],
    inspectors: [],
    statuses: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith("image/");
      if (!isValid)
        showNotification(
          `El archivo ${file.name} no es una imagen válida`,
          "error",
        );
      return isValid;
    });
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgId) => {
    setDeletedImageIds((prev) => [...prev, imgId]);
  };

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("EPP"); // EPP | EPC
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, empRes, statRes, catsRes, equipRes] = await Promise.all([
          api.get("/facilities"),
          api.get("/employees"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/protection-equipment-categories"),
          api.get("/protection/equipment"),
        ]);

        // Filtrar solo empleados de la gerencia ASHO (id: 8) para el select de inspector
        const ashoInspectors = (empRes || []).filter(
          (e) => e.managementId === 8 || e.management?.id === 8,
        );
        setLookups({
          facilities: facRes || [],
          inspectors: ashoInspectors,
          statuses: statRes || [],
        });

        // Merge cats and equip just like in Inventory!
        const mergedEquip = (catsRes || []).map((cat) => {
          const config = (equipRes || []).find(
            (eq) => eq.categoryId === cat.id,
          );
          const isEPP = cat.protectionTypeId === 1;
          const defaultClassification = isEPP ? "CABEZA" : "OTROS";

          return {
            id: config ? config.id : null,
            categoryId: cat.id,
            name: cat.name,
            category: cat,
            description: config
              ? config.description
              : `CLASIF: ${defaultClassification} | MARCA: GENÉRICO | MODELO: N/A | COD: S/N`,
            lastUpdate: config
              ? config.lastUpdate
              : new Date().toISOString().split("T")[0],
          };
        });

        if (initialData) {
          const protInsp = initialData.protectionInspection || {};
          const detailsList = protInsp.details || [];

          setFormData({
            date: initialData.date || new Date().toISOString().split("T")[0],
            facilityId: initialData.facilityId || "",
            inspectorId: initialData.employeePersonalNumber || "",
            statusId: initialData.statusId || 1,
            inspectionNumber: initialData.inspectionNumber || "",
            observations: protInsp.observations || "",
            isScheduled: !!initialData.isScheduled,
            scheduledDate: initialData.scheduledDate || "",
          });

          // Map registered equipment and DECODE serialized tri-state data from detail list matching categoryId
          const mappedEquip = mergedEquip.map((eq) => {
            const detail =
              detailsList.find((d) => d.categoryId === eq.categoryId) || {};

            let buenos = detail.operative !== undefined ? detail.operative : 0;
            let malos =
              detail.totalChecked !== undefined
                ? detail.totalChecked - detail.operative
                : 0;
            let commentText = "";

            if (detail.observations && detail.observations.includes("|")) {
              const parts = detail.observations.split("|");
              parts.forEach((part) => {
                const [key, val] = part.split(":");
                if (key === "B") buenos = parseInt(val) || 0;
                else if (key === "M") malos = parseInt(val) || 0;
                else if (key === "Obs") commentText = val || "";
              });
            } else {
              commentText = detail.observations || "";
            }

            return {
              ...eq,
              buenos,
              malos,
              commentText,
            };
          });

          mappedEquip.sort((a, b) => (a.categoryId || 0) - (b.categoryId || 0));
          setEquipmentToInspect(mappedEquip);
        } else {
          // Initialize audit parameters for all equipment registered in stock
          const mappedEquip = mergedEquip.map((eq) => ({
            ...eq,
            buenos: 0,
            malos: 0,
            commentText: "",
          }));

          mappedEquip.sort((a, b) => (a.categoryId || 0) - (b.categoryId || 0));
          setEquipmentToInspect(mappedEquip);
        }
      } catch (error) {
        showNotification(
          "Error al cargar datos del formulario de inspección",
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQtyChange = (index, field, value) => {
    setEquipmentToInspect((prev) => {
      const updated = [...prev];
      const numVal = parseInt(value) || 0;
      updated[index][field] = numVal >= 0 ? numVal : 0;
      return updated;
    });
  };

  const handleCommentChange = (index, value) => {
    setEquipmentToInspect((prev) => {
      const updated = [...prev];
      updated[index].commentText = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ─── 1. VALIDATE DATE ───
    if (!formData.date) {
      showNotification("La fecha de inspección es obligatoria", "error");
      return;
    }
    const auditDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (auditDate > today) {
      showNotification(
        "La fecha de inspección no puede ser una fecha futura",
        "error",
      );
      return;
    }

    // ─── 2. VALIDATE FACILITY ───
    if (!formData.facilityId) {
      showNotification("Debe seleccionar un Centro de Trabajo / Sede", "error");
      return;
    }

    // ─── 3. VALIDATE INSPECTOR ───
    if (!formData.inspectorId) {
      showNotification("Debe seleccionar un Inspector Responsable", "error");
      return;
    }

    // ─── 4. VALIDATE STATUS ───
    if (!formData.statusId) {
      showNotification("Debe seleccionar el Diagnóstico del Lote", "error");
      return;
    }

    // ─── 5. VALIDATE EQUIPMENT LIST EXISTS ───
    if (equipmentToInspect.length === 0) {
      showNotification(
        "No hay equipos registrados en stock para inspeccionar",
        "warning",
      );
      return;
    }

    // ─── 6. VALIDATE AT LEAST ONE EQUIPMENT HAS DATA ───
    const hasAnyData = equipmentToInspect.some(
      (eq) => (eq.buenos || 0) > 0 || (eq.malos || 0) > 0,
    );
    if (!hasAnyData) {
      showNotification(
        "Debe registrar cantidades (Buenos o No Sirven) en al menos un equipo",
        "error",
      );
      return;
    }

    // ─── 7. VALIDATE NO NEGATIVE QUANTITIES ───
    const hasNegative = equipmentToInspect.some(
      (eq) => (eq.buenos || 0) < 0 || (eq.malos || 0) < 0,
    );
    if (hasNegative) {
      showNotification(
        "Las cantidades no pueden ser valores negativos",
        "error",
      );
      return;
    }

    // ─── 8. VALIDATE OBSERVATION LENGTH ───
    if (formData.observations && formData.observations.length > 500) {
      showNotification(
        "Las observaciones generales no pueden exceder los 500 caracteres",
        "error",
      );
      return;
    }

    // ─── 9. VALIDATE INDIVIDUAL EQUIPMENT OBSERVATIONS LENGTH ───
    const longComment = equipmentToInspect.find(
      (eq) => eq.commentText && eq.commentText.length > 100,
    );
    if (longComment) {
      showNotification(
        `La observación del equipo "${longComment.name}" excede los 100 caracteres permitidos`,
        "error",
      );
      return;
    }

    setIsSubmitting(true);

    // Structure unique inspection code: EPI-[AÑO]-[SEDE]-[SECUENCIA]
    let finalInspectionNumber = formData.inspectionNumber;
    if (!initialData?.id) {
      const year = formData.date
        ? new Date(formData.date).getFullYear()
        : new Date().getFullYear();
      const selectedFac = lookups.facilities.find(
        (f) => f.id.toString() === formData.facilityId.toString(),
      );
      const facName = selectedFac
        ? selectedFac.name.trim().split(" ")[0].toUpperCase()
        : "SC";

      let nextSeq = 1;
      if (formData.facilityId) {
        const matchingInsps = (inspectionsList || []).filter(
          (i) =>
            i.facilityId?.toString() === formData.facilityId.toString() &&
            (i.type === "Proteccion" || i.protectionInspection),
        );
        nextSeq = matchingInsps.length + 1;
      }
      finalInspectionNumber = `EPI-${year}-${facName}-${nextSeq}`;
    }

    const protectionData = {
      responsibleId: formData.inspectorId,
      observations: formData.observations,
      details: equipmentToInspect.map((eq) => {
        const totalChecked = (eq.buenos || 0) + (eq.malos || 0);
        const operative = eq.buenos || 0;
        const cleanComment = eq.commentText
          ? eq.commentText
              .trim()
              .replace(/[|:]/g, "")
              .slice(0, 100)
              .toUpperCase()
          : "";
        const serializedObservations = `B:${eq.buenos || 0}|M:${eq.malos || 0}|Obs:${cleanComment}`;

        return {
          categoryId: eq.categoryId,
          totalChecked,
          operative,
          observations: serializedObservations,
        };
      }),
    };

    const isEditing = !!initialData?.id;
    const url = isEditing ? `/inspections/${initialData.id}` : "/inspections";
    const method = isEditing ? "PUT" : "POST";

    const formPayload = new FormData();
    formPayload.append("date", formData.date);
    formPayload.append("facilityId", parseInt(formData.facilityId));
    formPayload.append("inspectorId", formData.inspectorId);
    formPayload.append("statusId", parseInt(formData.statusId));
    formPayload.append("inspectionNumber", finalInspectionNumber);
    formPayload.append("observations", formData.observations);
    formPayload.append("type", "Proteccion");
    formPayload.append("isScheduled", formData.isScheduled ? "true" : "false");
    if (formData.isScheduled && formData.scheduledDate) {
      formPayload.append("scheduledDate", formData.scheduledDate);
    }
    formPayload.append("protectionData", JSON.stringify(protectionData));
    selectedFiles.forEach((file) => formPayload.append("images", file));
    if (deletedImageIds.length > 0) {
      formPayload.append("deletedImageIds", JSON.stringify(deletedImageIds));
    }

    try {
      const res = await api[method.toLowerCase()](url, { body: formPayload });

      if (res && !res.err) {
        showNotification(
          isEditing
            ? "Inspección de equipos actualizada con éxito"
            : "Inspección de equipos guardada con éxito",
          "success",
        );
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(
          res.statusText || "Error al guardar inspección",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión con el servidor", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="animate-spin text-corpoelec-blue" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">
          Preparando planilla de inspección...
        </p>
      </div>
    );
  }

  // Filter equipment list by Search term and active Tab (EPP/EPC)
  const filteredEquipToInspect = equipmentToInspect
    .map((eq, idx) => ({ ...eq, originalIndex: idx }))
    .filter((eq) => {
      const matchesSearch =
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eq.description &&
          eq.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const isEPP = eq.category?.protectionTypeId === 1;
      const matchesTab = activeTab === "EPP" ? isEPP : !isEPP;
      return matchesSearch && matchesTab;
    });

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[78vh] overflow-y-auto px-1 pr-2 text-txt-main no-scrollbar"
    >
      {/* SECTION 1: AUDIT & LOCALIZATION METADATA */}
      <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border-main/45">
          <MapPin size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Datos de Localización y Control
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-1 mt-1">
              <Calendar size={12} className="text-txt-muted" /> Fecha Inspección
              *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-bold text-center"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-txt-muted" /> Centro de Trabajo
              / Sede *
            </label>
            <select
              name="facilityId"
              required
              value={formData.facilityId}
              onChange={handleChange}
              className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-semibold text-txt-main bg-bg-surface cursor-pointer"
            >
              <option value="">Seleccione sede...</option>
              {lookups.facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-1 mt-1">
              <User size={12} className="text-txt-muted" /> Inspector
              Responsable *
            </label>
            <select
              name="inspectorId"
              required
              value={formData.inspectorId}
              onChange={handleChange}
              className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-semibold text-txt-main bg-bg-surface cursor-pointer"
            >
              <option value="">Seleccione inspector...</option>
              {lookups.inspectors.map((e) => (
                <option key={e.personalNumber} value={e.personalNumber}>
                  {e.firstName} {e.lastName} ({e.personalNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-1 mt-1">
              <Shield size={12} className="text-txt-muted" /> Diagnóstico del
              Lote *
            </label>
            <select
              name="statusId"
              required
              value={formData.statusId}
              onChange={handleChange}
              className="input-field h-12 font-black border border-border-main focus:border-corpoelec-blue text-txt-main bg-bg-surface cursor-pointer"
            >
              {lookups.statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nueva sección: Planificación / Programación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              ¿La inspección es programada?
            </label>
            <select
              name="isScheduled"
              required
              value={formData.isScheduled ? "true" : "false"}
              onChange={(e) => {
                const val = e.target.value === "true";
                setFormData((prev) => ({
                  ...prev,
                  isScheduled: val,
                  scheduledDate: val ? prev.scheduledDate : "",
                }));
              }}
              className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-bold text-txt-main bg-bg-surface cursor-pointer"
            >
              <option value="false">NO PROGRAMADA</option>
              <option value="true">PROGRAMADA</option>
            </select>
          </div>

          {formData.isScheduled && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Fecha Programada *
              </label>
              <input
                type="date"
                name="scheduledDate"
                required={formData.isScheduled}
                value={formData.scheduledDate}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: THE REGISTERED EQUIPMENT CHECKLIST */}
      <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-main/45">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck size={16} className="text-corpoelec-blue" />
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Inspección de Equipos de Stock Registrados
            </h4>
          </div>
          <span className="text-[9px] font-black uppercase text-corpoelec-blue bg-corpoelec-blue/10 px-2.5 py-1 rounded-md border border-corpoelec-blue/15">
            Planilla de Auditoría
          </span>
        </div>

        <>
          {/* Search Bar & Tab Selectors */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-1">
            {/* EPP / EPC Toggle Tabs */}
            <div className="flex bg-bg-main/40 p-1 rounded-2xl border border-border-main/60 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("EPP")}
                className={`flex-1 md:flex-initial px-5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                  activeTab === "EPP"
                    ? "bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/10"
                    : "text-txt-muted hover:text-txt-main"
                }`}
              >
                1. Equipos EPP (Personal)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("EPC")}
                className={`flex-1 md:flex-initial px-5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                  activeTab === "EPC"
                    ? "bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/10"
                    : "text-txt-muted hover:text-txt-main"
                }`}
              >
                2. Equipos EPC (Colectivo)
              </button>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Buscar material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 h-10 text-xs border border-border-main focus:border-corpoelec-blue uppercase"
              />
            </div>
          </div>

          {/* The Checked Stock Grid List */}
          <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                    <th className="px-6 py-4 w-12 text-center">Nro</th>
                    <th className="px-6 py-4">Equipo en Stock Inspeccionado</th>
                    <th className="px-6 py-4 text-center w-24">Medida</th>
                    <th className="px-6 py-4 text-center w-24 bg-emerald-500/5 text-emerald-500">
                      Buenos
                    </th>
                    <th className="px-6 py-4 text-center w-24 bg-corpoelec-red/5 text-corpoelec-red">
                      No Sirven
                    </th>
                    <th className="px-6 py-4 text-center w-20 bg-corpoelec-blue/5 text-corpoelec-blue">
                      Total
                    </th>
                    <th className="px-6 py-4">Observaciones Técnicas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/20">
                  {filteredEquipToInspect.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-txt-muted"
                      >
                        <FolderOpen
                          size={28}
                          className="mx-auto mb-2 opacity-25 text-txt-muted"
                        />
                        <p className="text-[10px] font-black uppercase tracking-wider">
                          No se encontraron equipos registrados para esta
                          clasificación
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredEquipToInspect.map((eq) => {
                      const idx = eq.originalIndex;
                      return (
                        <tr
                          key={eq.id}
                          className="hover:bg-bg-main/5 transition-colors"
                        >
                          <td className="px-6 py-4 text-center text-xs font-mono font-bold text-txt-muted">
                            {(eq.category?.id || eq.categoryId || 0)
                              .toString()
                              .padStart(2, "0")}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-txt-main uppercase tracking-tight leading-tight">
                                {eq.name}
                              </span>
                              <span className="text-[9px] text-txt-muted font-semibold uppercase mt-0.5">
                                Planilla: {eq.category?.name || "Sin renglón"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="text-[9px] font-black uppercase text-txt-muted bg-bg-main/30 px-2 py-0.5 rounded border border-border-main/60 tracking-wider">
                              {eq.category?.description || "PIEZAS"}
                            </span>
                          </td>

                          {/* Buenos */}
                          <td className="px-4 py-3 bg-emerald-500/5">
                            <input
                              type="number"
                              min="0"
                              value={eq.buenos === 0 ? "" : eq.buenos}
                              onChange={(e) =>
                                handleQtyChange(idx, "buenos", e.target.value)
                              }
                              className="w-full rounded-xl px-2.5 py-2 text-center text-xs font-black bg-bg-surface border border-emerald-500/30 text-emerald-500 focus:border-emerald-500 outline-none shadow-inner"
                            />
                          </td>

                          {/* No Sirven */}
                          <td className="px-4 py-3 bg-corpoelec-red/5">
                            <input
                              type="number"
                              min="0"
                              value={eq.malos === 0 ? "" : eq.malos}
                              onChange={(e) =>
                                handleQtyChange(idx, "malos", e.target.value)
                              }
                              className="w-full rounded-xl px-2.5 py-2 text-center text-xs font-black bg-bg-surface border border-corpoelec-red/30 text-corpoelec-red focus:border-corpoelec-red outline-none shadow-inner"
                            />
                          </td>

                          {/* Total (auto-calculado) */}
                          <td className="px-4 py-3 bg-corpoelec-blue/5 text-center">
                            <span className="inline-block min-w-[2.5rem] rounded-xl px-2.5 py-2 text-xs font-black bg-corpoelec-blue/10 border border-corpoelec-blue/30 text-corpoelec-blue">
                              {(eq.buenos || 0) + (eq.malos || 0)}
                            </span>
                          </td>

                          {/* Extra observations for this item */}
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={eq.commentText}
                              onChange={(e) =>
                                handleCommentChange(idx, e.target.value)
                              }
                              className="w-full rounded-xl px-3 py-2 text-xs bg-bg-main/10 border border-border-main text-txt-main placeholder:text-txt-muted/30 focus:border-corpoelec-blue outline-none uppercase font-semibold"
                              placeholder="Ej: DAÑADO EN MANGA IZQUIERDA"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      </div>

      {/* SECTION 3: GLOBAL INSPECTION DIAGNOSTICS */}
      <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border-main/45">
          <AlertCircle size={16} className="text-corpoelec-red" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Dictamen General y Observaciones
          </h4>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Observaciones Generales
          </label>
          <textarea
            name="observations"
            rows="3"
            value={formData.observations}
            onChange={handleChange}
            className="input-field py-3 resize-none min-h-[90px] border border-border-main focus:border-corpoelec-blue placeholder:text-txt-muted/30 uppercase"
            placeholder="Registre observaciones generales sobre el lote de seguridad o incidencias específicas..."
          />
        </div>
      </div>

      {/* REGISTRO FOTOGRÁFICO */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border-main/50">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Camera size={18} />
          </div>
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Registro Fotográfico (Opcional)
          </h4>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing images when editing */}
            {initialData?.images
              ?.filter((img) => !deletedImageIds.includes(img.id))
              .map((img) => (
                <div
                  key={`existing-${img.id}`}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border-main bg-bg-main group"
                >
                  <img
                    src={`${window.BACKEND_URL || "http://localhost:3000"}${img.imageUrl}`}
                    alt="Inspección"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-corpoelec-red text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            {/* New previews */}
            {previews.map((preview, idx) => (
              <div
                key={`preview-${idx}`}
                className="relative aspect-square rounded-2xl overflow-hidden border border-corpoelec-blue/30 bg-bg-main shadow-md group animate-in zoom-in duration-200"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-corpoelec-red text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {/* Upload button */}
            <label className="relative aspect-square rounded-2xl border-2 border-dashed border-border-main hover:border-corpoelec-blue/50 bg-bg-main/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-bg-main group overflow-hidden">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center text-txt-muted group-hover:text-corpoelec-blue transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                Cargar Fotos
              </span>
            </label>
          </div>
          <p className="text-[10px] text-txt-muted italic font-medium">
            Puedes seleccionar varias imágenes a la vez. Máximo 10MB por
            archivo.
          </p>
        </div>
      </div>

      {/* STICKY CONTROL FOOTER */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-border-main text-[11px] font-black uppercase text-txt-muted hover:text-txt-main hover:bg-bg-main/15 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || equipmentToInspect.length === 0}
          className="px-8 py-2.5 rounded-xl bg-corpoelec-blue text-white text-[11px] font-black uppercase shadow-lg shadow-corpoelec-blue/15 hover:bg-corpoelec-blue/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : initialData ? (
            "Actualizar Informe"
          ) : (
            "Guardar Informe Técnico"
          )}
        </button>
      </div>
    </form>
  );
}
