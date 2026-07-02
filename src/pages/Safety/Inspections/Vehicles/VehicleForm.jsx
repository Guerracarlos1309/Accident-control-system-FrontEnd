import { useState, useMemo, useEffect } from "react";
import {
  Car,
  MapPin,
  ClipboardCheck,
  AlertCircle,
  Truck,
  Hash,
  Palette,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Info,
  Loader2,
  User,
  Camera,
  X,
  Plus,
} from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function VehicleForm({
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
    statusId: 1,
    inspectorId: "",
    selectedPlate: "",
    inspectionNumber: "", // New field
    findings: "",
  });

  const [accessories, setAccessories] = useState([]);
  const [lookups, setLookups] = useState({
    vehicles: [],
    facilities: [],
    inspectors: [],
    statuses: [],
    accessoryMetadata: [],
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
      if (!isValid) showNotification(`El archivo ${file.name} no es una imagen válida`, "error");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, facRes, empRes, statRes, accRes] = await Promise.all([
          api.get("/vehicles"),
          api.get("/facilities"),
          api.get("/employees"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/vehicle-accessories"),
        ]);

        // Filtrar solo empleados de la gerencia ASHO (id: 8) para el select de inspector
        const ashoInspectors = (empRes || []).filter(
          (e) => e.managementId === 8 || e.management?.id === 8
        );
        setLookups({
          vehicles: vehRes || [],
          facilities: facRes || [],
          inspectors: ashoInspectors,
          statuses: statRes || [],
          accessoryMetadata: accRes || [],
        });

        if (initialData) {
          // If editing, use the provided data
          setFormData({
            date: initialData.date,
            facilityId: initialData.facilityId,
            statusId: initialData.statusId,
            inspectorId: initialData.employeePersonalNumber || "",
            selectedPlate: initialData.vehicleInspection?.plateId || "",
            inspectionNumber: initialData.inspectionNumber || "",
            findings: initialData.observations || "",
          });

          // If we have accessory data in initialData, use it.
          if (initialData.vehicleInspection?.accessoryChecks) {
            setAccessories(
              initialData.vehicleInspection.accessoryChecks.map((check) => {
                let buenos = check.status ? 1 : 0;
                let malos = check.status ? 0 : 1;
                let noExisten = 0;
                let commentText = "";
                if (check.observations && check.observations.includes("|")) {
                  const parts = check.observations.split("|");
                  parts.forEach((part) => {
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
                return {
                  accessoryId: check.accessoryId,
                  name: check.accessory?.name || "Accesorio",
                  exists,
                  buenos: exists ? buenos : 0,
                  malos: exists ? malos : 0,
                  noExisten,
                  observation: commentText,
                };
              }),
            );
          } else if (accRes) {
            // Fallback to metadata if no checks present
            setAccessories(
              accRes.map((acc) => ({
                accessoryId: acc.id,
                name: acc.name,
                exists: true,
                buenos: 1,
                malos: 0,
                noExisten: 0,
                observation: "",
              })),
            );
          }
        } else if (accRes) {
          setAccessories(
            accRes.map((acc) => ({
              accessoryId: acc.id,
              name: acc.name,
              exists: true,
              buenos: 1,
              malos: 0,
              noExisten: 0,
              observation: "",
            })),
          );
        }
      } catch (error) {
        showNotification("Error al cargar datos del formulario", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedVehicle = useMemo(() => {
    return lookups.vehicles.find((v) => v.plate === formData.selectedPlate);
  }, [formData.selectedPlate, lookups.vehicles]);

  // Auto-fill facility from the selected vehicle whenever plate changes
  useEffect(() => {
    if (selectedVehicle?.facilityId && !initialData) {
      setFormData((prev) => ({
        ...prev,
        facilityId: String(selectedVehicle.facilityId),
      }));
    }
  }, [selectedVehicle, initialData]);

  const generatedInspectionNumber = useMemo(() => {
    if (initialData?.inspectionNumber) {
      return initialData.inspectionNumber;
    }
    if (!formData.selectedPlate) {
      return "SELECCIONE PLACA...";
    }
    const year = formData.date
      ? new Date(formData.date).getFullYear()
      : new Date().getFullYear();
    const plate = formData.selectedPlate.trim().toUpperCase();

    let nextSeq = 1;
    if (inspectionsList && inspectionsList.length > 0) {
      const matchingInsps = inspectionsList.filter(
        (i) =>
          i.vehicleInspection?.plateId?.toUpperCase() === plate ||
          i.selectedPlate?.toUpperCase() === plate,
      );
      nextSeq = matchingInsps.length + 1;
    }
    return `${year}-${plate}-${nextSeq}`;
  }, [formData.date, formData.selectedPlate, inspectionsList, initialData]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleExists = (id, currentVal) => {
    setAccessories((prev) =>
      prev.map((acc) => {
        if (acc.accessoryId === id) {
          const nextVal = !currentVal;
          return {
            ...acc,
            exists: nextVal,
            buenos: nextVal ? 1 : 0,
            malos: nextVal ? 0 : 0,
            noExisten: nextVal ? 0 : 1,
            observation: nextVal ? "" : "NO EXISTE EN LA UNIDAD",
          };
        }
        return acc;
      }),
    );
  };

  const isBinaryAccessory = (name) => {
    const lower = (name || "").toLowerCase();
    return (
      lower.includes("pito") ||
      lower.includes("corneta") ||
      lower.includes("documento") ||
      lower.includes("herramienta") ||
      lower.includes("sistema elevacion") ||
      lower.includes("motor sist") ||
      lower.includes("tapa") ||
      lower.includes("varilla") ||
      lower.includes("otros") ||
      lower.includes("estabilizador")
    );
  };

  const getLimitForAccessory = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("extintor")) return 1;
    if (lower.includes("caucho repuesto") || lower.includes("caucho de repuesto")) return 1;
    if (lower.includes("triángulo") || lower.includes("triangulo")) return 2;
    if (lower.includes("cinturón") || lower.includes("cinturon")) return 6;
    if (lower.includes("asiento")) return 6;
    if (lower.includes("puerta")) return 4;
    if (lower.includes("parabrisa")) return 2;
    if (lower.includes("vidrios laterales") || lower.includes("vidrio lateral")) return 6;
    if (lower.includes("vidrio trasero")) return 1;
    if (lower.includes("limpiaparabrisa")) return 2;
    if (lower.includes("tuerca")) return 24;
    if (lower.includes("cauchos")) return 6;
    if (lower.includes("luces delanteras") || lower.includes("luz delantera")) return 2;
    if (lower.includes("cruce")) return 2;
    if (lower.includes("emergencia")) return 4;
    if (lower.includes("retroceso")) return 2;
    if (lower.includes("freno")) return 3;
    if (lower.includes("interna")) return 2;
    if (lower.includes("gato")) return 1;
    if (lower.includes("llave")) return 1;
    if (lower.includes("espejo")) return 1;
    return 10;
  };

  const updateAccessoryValue = (id, field, value) => {
    setAccessories((prev) =>
      prev.map((acc) => {
        if (acc.accessoryId === id) {
          // Handle text fields directly
          if (field === "observation") {
            return { ...acc, observation: value };
          }

          // Handle numeric fields with limit logic
          const limit = getLimitForAccessory(acc.name);
          const cleanValue = Math.max(0, value);
          let newBuenos = field === "buenos" ? cleanValue : acc.buenos;
          let newMalos = field === "malos" ? cleanValue : acc.malos;

          if (newBuenos + newMalos > limit) {
            if (field === "buenos") {
              newMalos = Math.max(0, limit - newBuenos);
              if (newBuenos > limit) newBuenos = limit;
            } else if (field === "malos") {
              newBuenos = Math.max(0, limit - newMalos);
              if (newMalos > limit) newMalos = limit;
            }
          }
          return { ...acc, buenos: newBuenos, malos: newMalos };
        }
        return acc;
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalInspectionNumber = initialData?.id
      ? formData.inspectionNumber
      : generatedInspectionNumber;

    const vehicleData = {
      plateId: formData.selectedPlate,
      description: `Inspección física de unidad ${formData.selectedPlate}`,
      accessoryChecks: accessories.map(
        ({ accessoryId, exists, buenos, malos, noExisten, observation }) => {
          const cleanComment = observation
            ? observation
                .trim()
                .replace(/[|:]/g, "")
                .slice(0, 100)
                .toUpperCase()
            : "";
          const actualNE = exists ? 0 : 1;
          const actualBuenos = exists ? buenos || 0 : 0;
          const actualMalos = exists ? malos || 0 : 0;

          const serializedObservations = `B:${actualBuenos}|M:${actualMalos}|NE:${actualNE}|Obs:${cleanComment || (exists ? "" : "NO EXISTE EN LA UNIDAD")}`;
          const isFunctional = exists && actualMalos === 0;

          return {
            accessoryId,
            status: isFunctional,
            observations: serializedObservations,
          };
        },
      ),
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
    formPayload.append("observations", formData.findings);
    formPayload.append("type", "Vehiculo");
    formPayload.append("vehicleData", JSON.stringify(vehicleData));
    selectedFiles.forEach((file) => formPayload.append("images", file));
    if (deletedImageIds.length > 0) {
      formPayload.append("deletedImageIds", JSON.stringify(deletedImageIds));
    }

    try {
      const res = await api[method.toLowerCase()](url, { body: formPayload });

      if (res && !res.err) {
        showNotification(
          isEditing
            ? "Inspección actualizada correctamente"
            : "Inspección guardada correctamente",
          "success",
        );
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(
          res.statusText || "Error al procesar inspección",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="animate-spin text-corpoelec-blue" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">
          Sincronizando bitácora digital...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECCIÓN 1: METADATA E IDENTIFICACIÓN */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Search size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            General y Unidad
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              Fecha Inspección *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="input-field h-12"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              Centro de Trabajo *
            </label>
            {selectedVehicle?.facility ? (
              // Sede auto-rellenada desde el vehículo → solo lectura
              <div className="input-field h-12 flex items-center gap-2 bg-corpoelec-blue/5 border-dashed border-corpoelec-blue/30 cursor-not-allowed select-none">
                <MapPin size={14} className="text-corpoelec-blue shrink-0" />
                <span className="text-xs font-black text-corpoelec-blue uppercase tracking-wider truncate">
                  {selectedVehicle.facility.name}
                </span>
              </div>
            ) : (
              <select
                name="facilityId"
                required
                value={formData.facilityId}
                onChange={handleChange}
                className="input-field h-12"
              >
                <option value="">Seleccione sede...</option>
                {lookups.facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              Inspector Responsable *
            </label>
            <select
              name="inspectorId"
              required
              value={formData.inspectorId}
              onChange={handleChange}
              className="input-field h-12"
            >
              <option value="">Seleccione inspector...</option>
              {lookups.inspectors.map((e) => (
                <option key={e.personalNumber} value={e.personalNumber}>
                  {e.firstName} {e.lastName} ({e.personalNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              N° de Inspección / Reporte (Auto)
            </label>
            <div className="relative">
              <input
                type="text"
                name="inspectionNumber"
                readOnly
                value={generatedInspectionNumber}
                className="input-field h-12 pl-9 font-black text-corpoelec-blue bg-bg-main/5 border-dashed cursor-not-allowed select-none outline-none focus:ring-0 focus:border-border-main"
              />
            </div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              Unidad a Inspeccionar *
            </label>
            <select
              name="selectedPlate"
              required
              value={formData.selectedPlate}
              onChange={handleChange}
              className="input-field h-12 text-corpoelec-blue font-black"
            >
              <option value="">Seleccione placa registrada...</option>
              {lookups.vehicles.map((v) => (
                <option key={v.plate} value={v.plate}>
                  {v.plate} ({v.model?.brand?.name} {v.model?.name})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
              Resultado Global *
            </label>
            <select
              name="statusId"
              required
              value={formData.statusId}
              onChange={handleChange}
              className="input-field h-12 font-black"
            >
              {lookups.statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INFO CARD */}
        {selectedVehicle ? (
          <div className="bg-corpoelec-blue/5 border border-corpoelec-blue/20 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-corpoelec-blue font-black text-lg leading-none uppercase tracking-tighter">
                <Truck size={20} />
                {selectedVehicle.model?.brand?.name}{" "}
                {selectedVehicle.model?.name}
              </div>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black text-txt-muted tracking-[0.1em]">
                    Año Fabricación
                  </span>
                  <span className="text-xs font-black text-txt-main">
                    {selectedVehicle.year}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black text-txt-muted tracking-[0.1em]">
                    Color Unidad
                  </span>
                  <span className="text-xs font-black text-txt-main">
                    {selectedVehicle.color}
                  </span>
                </div>
                {selectedVehicle.facility && (
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-black text-txt-muted tracking-[0.1em]">
                      Sede Asignada
                    </span>
                    <span className="text-xs font-black text-corpoelec-blue">
                      {selectedVehicle.facility.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-px md:bg-border-main" />
            <div className="flex flex-col justify-center">
              <span className="text-[9px] uppercase font-black text-txt-muted block mb-1">
                Tipo de Vehículo
              </span>
              <span className="inline-flex px-3 py-1 rounded-full bg-bg-main/10 text-txt-main text-[10px] font-black uppercase border border-border-main">
                {selectedVehicle.type?.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-border-main rounded-3xl flex flex-col items-center justify-center text-txt-muted/50 gap-2 bg-bg-main/5">
            <Info size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">
              Seleccione una placa para cargar ficha técnica
            </p>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: AUDITORÍA DE ACCESORIOS */}
      {formData.selectedPlate && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-border-main">
              <Package size={16} className="text-corpoelec-blue" />
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
                Checklist de Seguridad
              </h4>
            </div>

            <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                      <th className="px-6 py-4 w-12 text-center">Nro</th>
                      <th className="px-6 py-4">Accesorio / Equipo</th>
                      <th className="px-6 py-4 text-center w-36">
                        Sirve/Existe
                      </th>
                      <th className="px-4 py-4 text-center w-24 bg-emerald-500/5 text-emerald-500">
                        Sirve
                      </th>
                      <th className="px-4 py-4 text-center w-24 bg-corpoelec-red/5 text-corpoelec-red">
                        No Sirve
                      </th>
                      <th className="px-4 py-4 text-center w-28 bg-bg-main/5 text-txt-muted">
                        Cantidad
                      </th>
                      <th className="px-6 py-4">Observación del Inspector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/20">
                    {accessories.map((acc, index) => (
                      <tr
                        key={acc.accessoryId}
                        className={`transition-colors duration-350 ${acc.exists ? "hover:bg-bg-main/5" : "bg-bg-main/5/10 bg-black/5"}`}
                      >
                        <td className="px-6 py-4 text-center text-xs font-mono font-bold text-txt-muted">
                          {(index + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-txt-main uppercase tracking-tight leading-tight">
                            {acc.name}
                          </span>
                        </td>

                        {/* Toggle Switch: Existe */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center bg-bg-surface p-1 rounded-xl w-fit mx-auto border border-border-main shadow-inner">
                            <button
                              type="button"
                              onClick={() =>
                                toggleExists(acc.accessoryId, acc.exists)
                              }
                              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${acc.exists ? "bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                            >
                              SÍ
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toggleExists(acc.accessoryId, acc.exists)
                              }
                              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${!acc.exists ? "bg-corpoelec-red text-white shadow-md shadow-corpoelec-red/20" : "text-txt-muted hover:text-txt-main"}`}
                            >
                              NO
                            </button>
                          </div>
                        </td>

                        {/* Sirve (Buenos) */}
                        <td
                          className={`px-4 py-3 bg-emerald-500/5 text-center transition-all duration-300 ${!acc.exists ? "opacity-20" : ""}`}
                        >
                          {isBinaryAccessory(acc.name) ? (
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                              {acc.exists ? "✓ SÍ" : "—"}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={getLimitForAccessory(acc.name)}
                              disabled={!acc.exists}
                              value={
                                !acc.exists
                                  ? "0"
                                  : acc.buenos === 0
                                    ? ""
                                    : acc.buenos
                              }
                              onChange={(e) =>
                                updateAccessoryValue(
                                  acc.accessoryId,
                                  "buenos",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full rounded-xl px-2.5 py-2 text-center text-xs font-black bg-bg-surface border border-emerald-500/30 text-emerald-500 focus:border-emerald-500 outline-none shadow-inner disabled:cursor-not-allowed"
                            />
                          )}
                        </td>

                        {/* No Sirve (Fallas) */}
                        <td
                          className={`px-4 py-3 bg-corpoelec-red/5 text-center transition-all duration-300 ${!acc.exists ? "opacity-20" : ""}`}
                        >
                          {isBinaryAccessory(acc.name) ? (
                            <span className="text-[10px] font-black text-corpoelec-red/50 uppercase tracking-wider">
                              {!acc.exists ? "✗ NO/FALLA" : "—"}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={getLimitForAccessory(acc.name)}
                              disabled={!acc.exists}
                              value={
                                !acc.exists
                                  ? "0"
                                  : acc.malos === 0
                                    ? ""
                                    : acc.malos
                              }
                              onChange={(e) =>
                                updateAccessoryValue(
                                  acc.accessoryId,
                                  "malos",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full rounded-xl px-2.5 py-2 text-center text-xs font-black bg-bg-surface border border-corpoelec-red/30 text-corpoelec-red focus:border-corpoelec-red outline-none shadow-inner disabled:cursor-not-allowed"
                            />
                          )}
                        </td>

                        {/* Cantidad Total */}
                        <td
                          className={`px-4 py-3 bg-bg-main/5 text-center transition-all duration-300 ${!acc.exists ? "opacity-20" : ""}`}
                        >
                          <span className="inline-flex px-3 py-1 rounded-full bg-bg-surface border border-border-main/50 text-[11px] font-black text-txt-main min-w-[45px] justify-center shadow-sm">
                            {!acc.exists ? 0 : acc.buenos + acc.malos}
                          </span>
                        </td>

                        {/* Observation */}
                        <td
                          className={`px-6 py-4 transition-all duration-300 ${!acc.exists ? "opacity-40" : ""}`}
                        >
                          <input
                            type="text"
                            disabled={!acc.exists}
                            value={acc.observation}
                            onChange={(e) =>
                              updateAccessoryValue(
                                acc.accessoryId,
                                "observation",
                                e.target.value,
                              )
                            }
                            placeholder={
                              acc.exists ? "..." : "BLOQUEADO - NO EXISTE"
                            }
                            className="w-full bg-transparent border-none text-xs text-txt-muted focus:ring-0 italic placeholder:opacity-30 uppercase font-semibold disabled:cursor-not-allowed disabled:text-txt-muted/30"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-border-main">
              <AlertCircle size={16} className="text-corpoelec-red" />
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
                Hallazgos y Observaciones
              </h4>
            </div>
            <textarea
              name="findings"
              rows="3"
              value={formData.findings}
              onChange={handleChange}
              className="input-field py-4 resize-none min-h-[100px]"
              placeholder="Reporte detallado de anomalías e incidencias..."
            />
          </div>
        </div>
      )}

      {/* REGISTRO FOTOGRÁFICO */}
      <div className="space-y-6 mt-6">
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
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
            Puedes seleccionar varias imágenes a la vez. Máximo 10MB por archivo.
          </p>
        </div>
      </div>

      {/* FOOTER PEGAJOSO */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!formData.selectedPlate || isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : (
            "Finalizar Reporte"
          )}
        </button>
      </div>
    </form>
  );
}
