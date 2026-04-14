import { useState, useMemo } from "react";
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
  Info
} from "lucide-react";

// Mock database of registered vehicles for lookup
const REGISTERED_VEHICLES = [
  { plate: "A12BC3D", brand: "Toyota", model: "Hilux", type: "Pick-up", color: "Blanco", year: 2022, activeNumber: "AF-100201" },
  { plate: "G98HI7J", brand: "Ford", model: "F-150", type: "Pick-up", color: "Gris", year: 2021, activeNumber: "AF-100405" },
  { plate: "V55XY1Z", brand: "Chevrolet", model: "N300", type: "Van", color: "Blanco", year: 2023, activeNumber: "AF-100809" },
];

export default function VehicleForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    facilityId: "",
    selectedPlate: "",
    findings: ""
  });

  const [accessories, setAccessories] = useState([
    { id: 1, name: "Caucho de Repuesto", hasIt: true, quantity: 1, obs: "" },
    { id: 2, name: "Gato Hidráulico", hasIt: true, quantity: 1, obs: "" },
    { id: 3, name: "Llave de Cruz", hasIt: true, quantity: 1, obs: "" },
    { id: 4, name: "Triángulos de Seguridad", hasIt: true, quantity: 2, obs: "" },
    { id: 5, name: "Extintor de Incendios", hasIt: true, quantity: 1, obs: "" },
    { id: 6, name: "Botiquín de Primeros Auxilios", hasIt: false, quantity: 0, obs: "" },
  ]);

  const selectedVehicle = useMemo(() => {
    return REGISTERED_VEHICLES.find(v => v.plate === formData.selectedPlate);
  }, [formData.selectedPlate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleAccessory = (id) => {
    setAccessories(prev => prev.map(acc => {
      if (acc.id === id) {
        const hasIt = !acc.hasIt;
        return { ...acc, hasIt, quantity: hasIt ? 1 : 0 };
      }
      return acc;
    }));
  };

  const updateAccessory = (id, field, value) => {
    setAccessories(prev => prev.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving inspection log for vehicle:", { 
      plate: formData.selectedPlate,
      inspectionData: formData,
      accessories 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECCIÓN 1: SELECCIÓN DEL VEHÍCULO (LOOKUP) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Search size={16} className="text-blue-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Búsqueda de Unidad</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placa del Vehículo *</label>
            <select 
              name="selectedPlate" 
              required 
              value={formData.selectedPlate} 
              onChange={handleChange} 
              className="input-field h-11 text-blue-400 font-bold [&>option]:bg-slate-800"
            >
              <option value="">Seleccione placa registrada...</option>
              {REGISTERED_VEHICLES.map(v => (
                <option key={v.plate} value={v.plate}>{v.plate} ({v.brand} {v.model})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Centro de Trabajo / Asignación *</label>
            <select name="facilityId" required value={formData.facilityId} onChange={handleChange} className="input-field h-11 text-slate-300 [&>option]:bg-slate-800">
              <option value="">Seleccione sede...</option>
              <option value="1">Sede Regional Falcón</option>
              <option value="2">Subestación Coro I</option>
              <option value="3">Planta Josefa Camejo</option>
            </select>
          </div>
        </div>

        {/* INFO CARD (SOLO SI HAY VEHÍCULO SELECCIONADO) */}
        {selectedVehicle ? (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-black text-lg">
                  <Truck size={20} />
                  {selectedVehicle.brand} {selectedVehicle.model}
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Nro Activo</span>
                      <span className="text-xs font-mono text-slate-300">{selectedVehicle.activeNumber}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter">Año / Color</span>
                      <span className="text-xs text-slate-300">{selectedVehicle.year} - {selectedVehicle.color}</span>
                   </div>
                </div>
             </div>
             <div className="md:w-px md:bg-slate-800" />
             <div className="flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Tipo de Unidad</span>
                <span className="inline-flex px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase border border-slate-700">
                  {selectedVehicle.type}
                </span>
             </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-2">
            <Info size={24} />
            <p className="text-sm font-medium">Seleccione una placa para ver los detalles técnicos de la unidad</p>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: INVENTARIO DE ACCESORIOS */}
      {formData.selectedPlate && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Package size={16} className="text-amber-500" />
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Auditoría de Accesorios</h4>
            </div>
            
            <div className="glass-panel overflow-hidden border border-slate-800/50 rounded-2xl">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-900/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                        <th className="px-5 py-4 w-1/3">Nombre del Accesorio</th>
                        <th className="px-5 py-4 text-center">¿Lo Posee?</th>
                        <th className="px-5 py-4 text-center">Cant.</th>
                        <th className="px-5 py-4">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {accessories.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-slate-300">{acc.name}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center bg-slate-900/60 p-1 rounded-xl w-fit mx-auto border border-slate-800">
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.id)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${acc.hasIt ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500"}`}
                              >Sí</button>
                              <button
                                type="button"
                                onClick={() => toggleAccessory(acc.id)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!acc.hasIt ? "bg-red-600 text-white shadow-lg shadow-red-500/20" : "text-slate-500"}`}
                              >No</button>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <input 
                              type="number" min="0" disabled={!acc.hasIt}
                              value={acc.quantity} 
                              onChange={(e) => updateAccessory(acc.id, 'quantity', parseInt(e.target.value) || 0)}
                              className={`w-14 h-9 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs font-bold ${!acc.hasIt ? "opacity-20" : "text-blue-400"}`}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <input 
                              type="text" value={acc.obs} 
                              onChange={(e) => updateAccessory(acc.id, 'obs', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent border-none text-[11px] text-slate-400 focus:ring-0 italic"
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
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hallazgos Finales</h4>
            </div>
            <textarea 
              name="findings" rows="3" value={formData.findings} 
              onChange={handleChange} className="input-field py-4 resize-none" 
              placeholder="Reporte detallado de anomalías..." 
            />
          </div>
        </div>
      )}

      {/* FOOTER PEGAJOSO (SÓLIDO) */}
      <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">Cancelar</button>
        <button type="submit" disabled={!formData.selectedPlate} className={`btn-primary px-8 h-11 ${!formData.selectedPlate ? "opacity-50 cursor-not-allowed" : "shadow-lg shadow-blue-600/20"}`}>
          Guardar Informe de Inspección
        </button>
      </div>
    </form>
  );
}
