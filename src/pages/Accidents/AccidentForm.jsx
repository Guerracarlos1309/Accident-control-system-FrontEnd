import { useState } from "react";

export default function AccidentForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    location: "",
    description: "",
    inpsaselFile: "",
    affectedProperty: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving accident...", formData);
    // TODO: implement helpFetch POST here later
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Fecha */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Fecha del Accidente *</label>
          <input 
            type="date" 
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        {/* Hora */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Hora del Accidente *</label>
          <input 
            type="time" 
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        {/* Tipo de Accidente */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Tipo de Accidente</label>
          <select 
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="input-field text-slate-300 [&>option]:bg-slate-800"
          >
            <option value="">Seleccione un tipo</option>
            <option value="1">Caída</option>
            <option value="2">Corte</option>
            <option value="3">Eléctrico</option>
            <option value="4">Otro</option>
          </select>
        </div>

        {/* Locación / Sede */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Sede / Locación</label>
          <select 
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input-field text-slate-300 [&>option]:bg-slate-800"
          >
            <option value="">Seleccione locación</option>
            <option value="1">Sede Principal</option>
            <option value="2">Subestación Norte</option>
          </select>
        </div>

        {/* Expediente INPSASEL */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Nro de Expediente INPSASEL</label>
          <input 
            type="text" 
            name="inpsaselFile"
            placeholder="Ej: INP-2023-XXXX"
            value={formData.inpsaselFile}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Descripción del Suceso *</label>
          <textarea 
            name="description"
            rows="4" 
            required
            placeholder="Describa cómo ocurrió el accidente detalladamente..."
            value={formData.description}
            onChange={handleChange}
            className="input-field resize-none" 
          ></textarea>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary py-2 text-sm">
          Registrar Accidente
        </button>
      </div>
    </form>
  );
}
