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

        setLookups({
          vehicles: vehRes || [],
          facilities: facRes || [],
          inspectors: empRes || [],
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

  const updateAccessoryValue = (id, field, value) => {
    setAccessories((prev) =>
      prev.map((acc) =>
        acc.accessoryId === id ? { ...acc, [field]: value } : acc,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalInspectionNumber = initialData?.id
      ? formData.inspectionNumber
      : generatedInspectionNumber;

    const payload = {
      date: formData.date,
      facilityId: parseInt(formData.facilityId),
      inspectorId: formData.inspectorId, // Use as string (personalNumber)
      statusId: parseInt(formData.statusId),
      inspectionNumber: finalInspectionNumber,
      observations: formData.findings,
      type: "Vehiculo",
      vehicleData: {
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
              status: isFunctional, // Match backend model
              observations: serializedObservations, // Match backend model
            };
          },
        ),
      },
    };

    const isEditing = !!initialData?.id;
    const url = isEditing ? `/inspections/${initialData.id}` : "/inspections";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await api[method.toLowerCase()](url, { body: payload });

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
                      <th className="px-6 py-4 text-center w-36">¿Existe?</th>
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
                          className={`px-4 py-3 bg-emerald-500/5 transition-all duration-300 ${!acc.exists ? "opacity-20" : ""}`}
                        >
                          <input
                            type="number"
                            min="0"
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
                        </td>

                        {/* No Sirve (Fallas) */}
                        <td
                          className={`px-4 py-3 bg-corpoelec-red/5 transition-all duration-300 ${!acc.exists ? "opacity-20" : ""}`}
                        >
                          <input
                            type="number"
                            min="0"
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
