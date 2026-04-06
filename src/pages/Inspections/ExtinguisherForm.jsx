import { useState } from "react";

export default function ExtinguisherForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    extinguisherCode: "",
    agentType: "",
    capacity: "",
    rechargeDate: "",
    expirationDate: "",
    status: "1",
    observations: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving extinguisher inspection...", formData);
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
          <label className="text-sm font-medium text-slate-300">Código del Extintor *</label>
          <input 
            type="text" 
            name="extinguisherCode"
            placeholder="Ej: EXT-001"
            required
            value={formData.extinguisherCode}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Agente Extintor</label>
          <select 
            name="agentType"
            value={formData.agentType}
            onChange={handleChange}
            className="input-field text-slate-300 [&>option]:bg-slate-800"
          >
            <option value="">Seleccione agente</option>
            <option value="1">PQS (Polvo Químico Seco)</option>
            <option value="2">CO2 (Dióxido de Carbono)</option>
            <option value="3">Agua</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Capacidad (Lbs/Kg)</label>
          <input 
            type="number" 
            name="capacity"
            placeholder="Ej: 10"
            value={formData.capacity}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Fecha de Última Recarga</label>
          <input 
            type="date" 
            name="rechargeDate"
            value={formData.rechargeDate}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Fecha de Vencimiento *</label>
          <input 
            type="date" 
            name="expirationDate"
            required
            value={formData.expirationDate}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Estado General</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="1" checked={formData.status === "1"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500" />
              Operativo
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="2" checked={formData.status === "2"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-red-500" />
              Requiere Recarga/Mantenimiento
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="3" checked={formData.status === "3"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-yellow-500" />
              Inoperativo
            </label>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Observaciones Generales</label>
          <textarea 
            name="observations"
            rows="3" 
            placeholder="Novedades de la manguera, manómetro, precinto..."
            value={formData.observations}
            onChange={handleChange}
            className="input-field resize-none" 
          ></textarea>
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
