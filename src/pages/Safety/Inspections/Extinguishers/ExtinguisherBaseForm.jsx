import { useState } from "react";

export default function ExtinguisherBaseForm({ onCancel }) {
  const [formData, setFormData] = useState({
    extinguisherNumber: "", agentTypeId: "", capacity: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving base extinguisher...", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Número de Extintor *</label>
          <input type="text" name="extinguisherNumber" required value={formData.extinguisherNumber} onChange={handleChange} className="input-field" placeholder="Ej: EXT-005" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Tipo de Agente</label>
          <select name="agentTypeId" value={formData.agentTypeId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione agente</option>
            <option value="1">PQS (Polvo Químico Seco)</option>
            <option value="2">CO2 (Dióxido de Carbono)</option>
            <option value="3">Agua</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Capacidad Teórica (Lbs/Kg)</label>
          <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="input-field" placeholder="10" />
        </div>

      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
        <button type="submit" className="btn-primary py-2 text-sm">Registrar Extintor</button>
      </div>
    </form>
  );
}
