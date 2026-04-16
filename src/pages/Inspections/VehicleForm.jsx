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
  User
} from "lucide-react";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";

export default function VehicleForm({ onCancel, onSuccess, initialData }) {
  const api = helpFetch();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    facilityId: "",
    statusId: 1,
    inspectorId: "",
    selectedPlate: "",
    inspectionNumber: "", // New field
    findings: ""
  });

  const [accessories, setAccessories] = useState([]);
  const [lookups, setLookups] = useState({
    vehicles: [],
    facilities: [],
    inspectors: [],
    statuses: [],
    accessoryMetadata: []
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
          api.get("/lookups/vehicle-accessories")
        ]);

        setLookups({
          vehicles: vehRes || [],
          facilities: facRes || [],
          inspectors: empRes || [],
          statuses: statRes || [],
          accessoryMetadata: accRes || []
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
            findings: initialData.observations || ""
          });

          // If we have accessory data in initialData, use it. 
          // Note: we fetch full details in VehicleManager before opening this, or expect it here.
          if (initialData.vehicleInspection?.accessoryChecks) {
            setAccessories(initialData.vehicleInspection.accessoryChecks.map(check => ({
              accessoryId: check.accessoryId,
              name: check.accessory?.name || "Accesorio",
              isFunctional: check.status,
              observation: check.observations || ""
            })));
          } else if (accRes) {
            // Fallback to metadata if no checks present
            setAccessories(accRes.map(acc => ({
              accessoryId: acc.id,
              name: acc.name,
              isFunctional: true,
              observation: ""
            })));
          }
        } else if (accRes) {
          setAccessories(accRes.map(acc => ({
            accessoryId: acc.id,
            name: acc.name,
            isFunctional: true,
            observation: ""
          })));
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
    return lookups.vehicles.find(v => v.plate === formData.selectedPlate);
  }, [formData.selectedPlate, lookups.vehicles]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleAccessory = (id) => {
    setAccessories(prev => prev.map(acc => {
      if (acc.accessoryId === id) {
        return { ...acc, isFunctional: !acc.isFunctional };
      }
      return acc;
    }));
  };

  const updateAccessoryValue = (id, field, value) => {
    setAccessories(prev => prev.map(acc => 
      acc.accessoryId === id ? { ...acc, [field]: value } : acc
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      date: formData.date,
      facilityId: parseInt(formData.facilityId),
      inspectorId: formData.inspectorId, // Use as string (personalNumber)
      statusId: parseInt(formData.statusId),
      inspectionNumber: formData.inspectionNumber,
      observations: formData.findings,
      type: "Vehiculo",
      vehicleData: {
        plateId: formData.selectedPlate,
        description: `Inspección física de unidad ${formData.selectedPlate}`,
        accessoryChecks: accessories.map(({ accessoryId, isFunctional, observation }) => ({
          accessoryId,
          status: !!isFunctional, // Match backend model
          observations: observation // Match backend model
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
          isEditing ? "Inspección actualizada correctamente" : "Inspección guardada correctamente", 
          "success"
        );
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(res.statusText || "Error al procesar inspección", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-500">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-sm font-medium tracking-wide uppercase">Preparando bitácora digital...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECCIÓN 1: METADATA E IDENTIFICACIÓN */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Search size={16} className="text-blue-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">General y Unidad</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Inspección *</label>
            <input 
               type="date" name="date" required value={formData.date} onChange={handleChange}
               className="input-field h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Centro de Trabajo *</label>
            <select 
              name="facilityId" required value={formData.facilityId} onChange={handleChange} 
              className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
            >
              <option value="">Seleccione sede...</option>
              {lookups.facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inspector Responsable *</label>
            <select name="inspectorId" required value={formData.inspectorId} onChange={handleChange} className="input-field h-11 text-slate-300 [&>option]:bg-slate-800">
              <option value="">Seleccione inspector...</option>
              {lookups.inspectors.map(e => (
                <option key={e.personalNumber} value={e.personalNumber}>{e.firstName} {e.lastName} ({e.personalNumber})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">N° de Inspección / Reporte *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" name="inspectionNumber" required value={formData.inspectionNumber} 
                onChange={handleChange} placeholder="Ej: AS-2024-001"
                className="input-field h-11 pl-9 font-mono text-blue-400"
              />
            </div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidad a Inspeccionar *</label>
            <select 
              name="selectedPlate" 
              required 
              value={formData.selectedPlate} 
              onChange={handleChange} 
              className="input-field h-11 text-blue-400 font-bold [&>option]:bg-slate-800"
            >
              <option value="">Seleccione placa registrada...</option>
              {lookups.vehicles.map(v => (
                <option key={v.plate} value={v.plate}>{v.plate} ({v.model?.brand?.name} {v.model?.name})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resultado Global *</label>
            <select 
              name="statusId" required value={formData.statusId} onChange={handleChange} 
              className="input-field h-11 text-slate-300 [&>option]:bg-slate-800 font-bold"
            >
              {lookups.statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* INFO CARD */}
        {selectedVehicle ? (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-black text-lg leading-none">
                  <Truck size={20} />
                  {selectedVehicle.model?.brand?.name} {selectedVehicle.model?.name}
                </div>
                <div className="flex gap-8">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Año Fabricación</span>
                      <span className="text-xs font-mono text-slate-300">{selectedVehicle.year}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Color Unidad</span>
                      <span className="text-xs text-slate-300">{selectedVehicle.color}</span>
                   </div>
                </div>
             </div>
             <div className="md:w-px md:bg-slate-800" />
             <div className="flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Tipo de Vehículo</span>
                <span className="inline-flex px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black uppercase border border-slate-700">
                  {selectedVehicle.type?.name}
                </span>
             </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2">
            <Info size={24} />
            <p className="text-sm font-medium">Seleccione una placa para cargar los datos técnicos automáticamente</p>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: AUDITORÍA DE ACCESORIOS */}
      {formData.selectedPlate && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Package size={16} className="text-amber-500" />
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Checklist de Accesorios y Seguridad</h4>
            </div>
            
            <div className="glass-panel overflow-hidden border border-slate-800/50 rounded-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-900/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                        <th className="px-5 py-4 w-1/2">Accesorio / Equipo</th>
                        <th className="px-5 py-4 text-center">Estado Funcional</th>
                        <th className="px-5 py-4">Observación Específica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {accessories.map((acc) => (
                        <tr key={acc.accessoryId} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-slate-300">{acc.name}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center bg-slate-900/40 p-1 rounded-xl w-fit mx-auto border border-slate-800">
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.accessoryId)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${acc.isFunctional ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-slate-500 hover:text-slate-300"}`}
                              >OK</button>
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.accessoryId)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!acc.isFunctional ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-slate-500 hover:text-slate-300"}`}
                              >Falla</button>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <input 
                              type="text" value={acc.observation} 
                              onChange={(e) => updateAccessoryValue(acc.accessoryId, 'observation', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent border-none text-xs text-slate-400 focus:ring-0 italic placeholder:opacity-30"
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
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <AlertCircle size={16} className="text-red-500" />
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hallazgos y Recomendaciones Finales</h4>
            </div>
            <textarea 
              name="findings" rows="3" value={formData.findings} 
              onChange={handleChange} className="input-field py-4 resize-none text-sm" 
              placeholder="Reporte detallado de anomalías o incidencias encontradas..." 
            />
          </div>
        </div>
      )}

      {/* FOOTER PEGAJOSO */}
      <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
        <button 
          type="submit" 
          disabled={!formData.selectedPlate || isSubmitting} 
          className={`btn-primary px-10 h-11 ${(!formData.selectedPlate || isSubmitting) ? "opacity-50 cursor-not-allowed" : "shadow-lg shadow-blue-600/20"}`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : "Finalizar y Guardar Reporte"}
        </button>
      </div>
    </form>
  );
}
