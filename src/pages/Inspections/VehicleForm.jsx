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
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
        <Loader2 size={40} className="animate-spin text-corpoelec-blue" />
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">Sincronizando bitácora digital...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECCIÓN 1: METADATA E IDENTIFICACIÓN */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Search size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">General y Unidad</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Fecha Inspección *</label>
            <input 
               type="date" name="date" required value={formData.date} onChange={handleChange}
               className="input-field h-12"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Centro de Trabajo *</label>
            <select 
              name="facilityId" required value={formData.facilityId} onChange={handleChange} 
              className="input-field h-12"
            >
              <option value="">Seleccione sede...</option>
              {lookups.facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Inspector Responsable *</label>
            <select name="inspectorId" required value={formData.inspectorId} onChange={handleChange} className="input-field h-12">
              <option value="">Seleccione inspector...</option>
              {lookups.inspectors.map(e => (
                <option key={e.personalNumber} value={e.personalNumber}>{e.firstName} {e.lastName} ({e.personalNumber})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">N° de Inspección / Reporte *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={14} />
              <input 
                type="text" name="inspectionNumber" required value={formData.inspectionNumber} 
                onChange={handleChange} placeholder="Ej: AS-2024-001"
                className="input-field h-12 pl-9 font-bold text-corpoelec-blue"
              />
            </div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Unidad a Inspeccionar *</label>
            <select 
              name="selectedPlate" 
              required 
              value={formData.selectedPlate} 
              onChange={handleChange} 
              className="input-field h-12 text-corpoelec-blue font-black"
            >
              <option value="">Seleccione placa registrada...</option>
              {lookups.vehicles.map(v => (
                <option key={v.plate} value={v.plate}>{v.plate} ({v.model?.brand?.name} {v.model?.name})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Resultado Global *</label>
            <select 
              name="statusId" required value={formData.statusId} onChange={handleChange} 
              className="input-field h-12 font-black"
            >
              {lookups.statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
                  {selectedVehicle.model?.brand?.name} {selectedVehicle.model?.name}
                </div>
                <div className="flex gap-8">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-txt-muted tracking-[0.1em]">Año Fabricación</span>
                      <span className="text-xs font-black text-txt-main">{selectedVehicle.year}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black text-txt-muted tracking-[0.1em]">Color Unidad</span>
                      <span className="text-xs font-black text-txt-main">{selectedVehicle.color}</span>
                   </div>
                </div>
             </div>
             <div className="md:w-px md:bg-border-main" />
             <div className="flex flex-col justify-center">
                <span className="text-[9px] uppercase font-black text-txt-muted block mb-1">Tipo de Vehículo</span>
                <span className="inline-flex px-3 py-1 rounded-full bg-bg-main/10 text-txt-main text-[10px] font-black uppercase border border-border-main">
                  {selectedVehicle.type?.name}
                </span>
             </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-border-main rounded-3xl flex flex-col items-center justify-center text-txt-muted/50 gap-2 bg-bg-main/5">
            <Info size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">Seleccione una placa para cargar ficha técnica</p>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: AUDITORÍA DE ACCESORIOS */}
      {formData.selectedPlate && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-border-main">
              <Package size={16} className="text-corpoelec-blue" />
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Checklist de Seguridad</h4>
            </div>
            
            <div className="overflow-hidden border border-border-main rounded-3xl bg-bg-main/5">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-bg-main/10 text-[10px] font-black uppercase text-txt-muted tracking-[0.1em] border-b border-border-main">
                        <th className="px-6 py-4 w-1/2">Accesorio / Equipo</th>
                        <th className="px-6 py-4 text-center">Estado</th>
                        <th className="px-6 py-4">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main">
                      {accessories.map((acc) => (
                        <tr key={acc.accessoryId} className="hover:bg-bg-main/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-txt-main">{acc.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center bg-bg-surface p-1 rounded-xl w-fit mx-auto border border-border-main">
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.accessoryId)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${acc.isFunctional ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                              >OK</button>
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.accessoryId)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!acc.isFunctional ? "bg-corpoelec-red text-white shadow-lg shadow-corpoelec-red/20" : "text-txt-muted hover:text-txt-main"}`}
                              >Falla</button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input 
                              type="text" value={acc.observation} 
                              onChange={(e) => updateAccessoryValue(acc.accessoryId, 'observation', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent border-none text-xs text-txt-muted focus:ring-0 italic placeholder:opacity-30"
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
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Hallazgos y Observaciones</h4>
            </div>
            <textarea 
              name="findings" rows="3" value={formData.findings} 
              onChange={handleChange} className="input-field py-4 resize-none min-h-[100px]" 
              placeholder="Reporte detallado de anomalías e incidencias..." 
            />
          </div>
        </div>
      )}

      {/* FOOTER PEGAJOSO */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button type="button" onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors">Cancelar</button>
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
          ) : "Finalizar Reporte"}
        </button>
      </div>
    </form>
  );
}
