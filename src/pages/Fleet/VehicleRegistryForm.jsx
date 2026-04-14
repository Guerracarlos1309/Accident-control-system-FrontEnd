import { useState } from "react";
import { 
  Truck, 
  Hash, 
  Palette, 
  Calendar, 
  Car,
  Settings,
  Shield
} from "lucide-react";

export default function VehicleRegistryForm({ onCancel }) {
  const [formData, setFormData] = useState({
    plate: "",
    activeNumber: "",
    brand: "",
    model: "",
    type: "camioneta", // sedan | camioneta | camion | moto | especial
    color: "",
    year: new Date().getFullYear(),
    status: "activo", // activo | mantenimiento | inactivo
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering vehicle to fleet...", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificación Principal */}
        <div className="col-span-1 border-b border-slate-800 pb-4 md:col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Shield size={16} className="text-blue-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identificación Técnica</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placa / Serial *</label>
                <input 
                  type="text" 
                  name="plate" 
                  required 
                  value={formData.plate} 
                  onChange={handleChange} 
                  className="input-field h-11 uppercase font-bold text-blue-400 placeholder:normal-case shadow-sm" 
                  placeholder="Ej: ABC-123" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Número de Activo</label>
                <input 
                  type="text" 
                  name="activeNumber" 
                  value={formData.activeNumber} 
                  onChange={handleChange} 
                  className="input-field h-11 font-mono" 
                  placeholder="AF-XXXXXX" 
                />
              </div>
           </div>
        </div>

        {/* Detalles del Vehículo */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
             <Car size={16} className="text-emerald-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Características</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="input-field h-10" placeholder="Ej: Toyota" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} className="input-field h-10" placeholder="Ej: Hilux" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Año de Fabricación</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} className="input-field h-10" />
              </div>
           </div>
        </div>

        {/* Clasificación */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
             <Settings size={16} className="text-amber-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Categorización</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Vehículo</label>
                <select name="type" value={formData.type} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                  <option value="sedan">Sedán</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="camion">Camión</option>
                  <option value="moto">Moto</option>
                  <option value="especial">Especial / Maquinaria</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Color Predominante</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-field h-10" placeholder="Ej: Blanco" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estatus Operativo</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800 font-bold text-blue-400">
                  <option value="activo">En Operación (Activo)</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="inactivo">Desincorporado / Inactivo</option>
                </select>
              </div>
           </div>
        </div>

      </div>

      {/* FOOTER PEGAJOSO (SÓLIDO) */}
      <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary px-8 h-11"
        >
          Registrar en Flota
        </button>
      </div>
    </form>
  );
}
