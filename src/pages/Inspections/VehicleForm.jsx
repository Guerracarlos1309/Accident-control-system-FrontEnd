import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function VehicleForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    plate: "",
    description: "",
  });

  const [accessories, setAccessories] = useState([
    { id: 1, name: "Caucho de Repuesto", status: true, quantity: 1, obs: "" }
  ]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addAccessory = () => {
    setAccessories([...accessories, { id: Date.now(), name: "", status: true, quantity: 1, obs: "" }]);
  };

  const removeAccessory = (id) => {
    setAccessories(accessories.filter(a => a.id !== id));
  };

  const updateAccessory = (id, field, value) => {
    setAccessories(accessories.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving vehicle inspection...", { ...formData, accessories });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Fecha de Inspección *</label>
          <input 
            type="date" 
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Placa del Vehículo *</label>
          <select 
            name="plate"
            required
            value={formData.plate}
            onChange={handleChange}
            className="input-field text-slate-300 [&>option]:bg-slate-800"
          >
            <option value="">Seleccione un vehículo</option>
            <option value="ABC-12D">ABC-12D (Toyota Hilux)</option>
            <option value="XYZ-98W">XYZ-98W (Ford F-150)</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Descripción / Observaciones Generales</label>
          <textarea 
            name="description"
            rows="3" 
            placeholder="Condición general de la carrocería, luces, etc..."
            value={formData.description}
            onChange={handleChange}
            className="input-field resize-none" 
          ></textarea>
        </div>

        {/* Detalles de Accesorios */}
        <div className="md:col-span-2 border border-slate-700/60 rounded-xl bg-slate-800/30 overflow-hidden">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/60 flex justify-between items-center relative z-10">
            <h4 className="font-semibold text-slate-200">Revisión de Accesorios</h4>
            <button 
              type="button" 
              onClick={addAccessory}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white flex items-center gap-1 transition-colors"
            >
              <Plus size={16} /> Añadir 
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {accessories.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-2">No se han registrado detalles de accesorios.</p>
            )}
            
            {accessories.map((acc, index) => (
              <div key={acc.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs text-slate-400 md:hidden">Accesorio</label>
                  <input 
                    type="text" 
                    placeholder="Nombre accesorio" 
                    value={acc.name}
                    onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)}
                    className="input-field py-1.5 text-sm" 
                  />
                </div>
                
                <div className="md:col-span-3 lg:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 md:hidden">Estado</label>
                  <select 
                    value={acc.status}
                    onChange={(e) => updateAccessory(acc.id, 'status', e.target.value === 'true')}
                    className="input-field py-1.5 text-sm [&>option]:bg-slate-800"
                  >
                    <option value="true">Operativo</option>
                    <option value="false">Dañado/Falta</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs text-slate-400 md:hidden">Cant.</label>
                  <input 
                    type="number" min="1"
                    value={acc.quantity}
                    onChange={(e) => updateAccessory(acc.id, 'quantity', e.target.value)}
                    className="input-field py-1.5 text-sm" 
                  />
                </div>

                <div className="md:col-span-3 flex items-start gap-2 space-y-1 mt-1 md:mt-0">
                  <div className="flex-1 w-full relative">
                    <label className="text-xs text-slate-400 md:hidden">Observación</label>
                    <input 
                      type="text" 
                      placeholder="Obs..." 
                      value={acc.obs}
                      onChange={(e) => updateAccessory(acc.id, 'obs', e.target.value)}
                      className="input-field py-1.5 text-sm w-full" 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeAccessory(acc.id)}
                    className="p-1.5 mt-0 md:mt-0 lg:mt-0 rounded text-red-400 hover:text-red-300 hover:bg-slate-700 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary py-2 text-sm">
          Guardar Inspección
        </button>
      </div>
    </form>
  );
}
