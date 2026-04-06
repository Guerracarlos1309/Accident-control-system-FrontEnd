import { useState } from "react";

export default function InstalacionesForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    facilityName: "",
    inspectedArea: "",
    inspectorName: "",
    status: "1",
    observations: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Guardando inspección de instalaciones...", formData);
    // Añadir lógica de guardado
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium text-slate-300">Fecha de Inspección *</label>
          <input 
            id="date"
            type="date" 
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="facilityName" className="text-sm font-medium text-slate-300">Sede / Subestación *</label>
          <input 
            id="facilityName"
            type="text" 
            name="facilityName"
            placeholder="Ej: Planta Termoeléctrica..."
            required
            value={formData.facilityName}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="inspectedArea" className="text-sm font-medium text-slate-300">Áreas Inspeccionadas</label>
          <input 
            id="inspectedArea"
            type="text" 
            name="inspectedArea"
            placeholder="Comedores, oficinas, sala de control..."
            value={formData.inspectedArea}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="inspectorName" className="text-sm font-medium text-slate-300">Inspector a Cargo *</label>
          <input 
            id="inspectorName"
            type="text" 
            name="inspectorName"
            placeholder="Nombre del encargado de la inspección"
            required
            value={formData.inspectorName}
            onChange={handleChange}
            className="input-field" 
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Estado General de las Instalaciones</label>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="1" checked={formData.status === "1"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-blue-500" />
              Condiciones Óptimas
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="2" checked={formData.status === "2"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-yellow-500" />
              Requiere Mantenimiento / Atención
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="radio" name="status" value="3" checked={formData.status === "3"} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 focus:ring-red-500" />
              Riesgo Laboral / Crítico
            </label>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="observations" className="text-sm font-medium text-slate-300">Observaciones y Novedades *</label>
          <textarea 
            id="observations"
            name="observations"
            rows="4" 
            required
            placeholder="Describa los hallazgos, si hay fallas estructurales, iluminación, limpieza..."
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
