import { useState } from "react";

export default function VehicleBaseForm({ onCancel }) {
  const [formData, setFormData] = useState({
    plate: "", brandId: "", modelId: "", vehicleTypeId: "", color: "", year: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving vehicle...", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Placa *</label>
          <input type="text" name="plate" required value={formData.plate} onChange={handleChange} className="input-field" placeholder="ABC-12D" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Color</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-field" placeholder="Blanco" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Marca</label>
          <select name="brandId" value={formData.brandId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione marca</option>
            <option value="1">Toyota</option>
            <option value="2">Ford</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Modelo</label>
          <select name="modelId" value={formData.modelId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione modelo</option>
            <option value="1">Hilux (Toyota)</option>
            <option value="2">F-150 (Ford)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Tipo de Vehículo</label>
          <select name="vehicleTypeId" value={formData.vehicleTypeId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione tipo</option>
            <option value="1">Camioneta Pick-up</option>
            <option value="2">Camión Cesta</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Año de Fabricación</label>
          <input type="number" name="year" value={formData.year} onChange={handleChange} className="input-field" placeholder="2015" />
        </div>

      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
        <button type="submit" className="btn-primary py-2 text-sm">Registrar Vehículo</button>
      </div>
    </form>
  );
}
