import { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Zap, 
  Globe, 
  Settings,
  Shield,
  Layers
} from "lucide-react";
import GeographicCascade from "../../components/GeographicCascade";

export default function FacilityForm({ onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    coordinates: "",
    installationTypeId: "",
    voltageLevel: "",
    description: "",
  });

  const [location, setLocation] = useState({
    stateId: "",
    cityId: "",
    parish: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationChange = (geoData) => {
    setLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, ...location };
    console.log("Registering industrial facility...", finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Building2 size={16} className="text-blue-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identificación de la Sede</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre de la Sede / Planta *</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange} 
              className="input-field h-11" 
              placeholder="Ej: Planta Termoeléctrica Josefa Camejo" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Instalación *</label>
            <select 
              name="installationTypeId" 
              required 
              value={formData.installationTypeId} 
              onChange={handleChange} 
              className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
            >
              <option value="">Seleccione tipo...</option>
              <option value="1">Subestación (S/E)</option>
              <option value="2">Planta Generadora</option>
              <option value="3">Oficina Comercial / Administrativa</option>
              <option value="4">Centro de Distribución</option>
              <option value="5">Taller / Almacén</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: UBICACIÓN GEOGRÁFICA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <MapPin size={16} className="text-emerald-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ubicación y Territorio</h4>
        </div>
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 shadow-inner">
           <GeographicCascade 
             value={location} 
             onChange={handleLocationChange} 
             required={true}
           />
        </div>
      </div>

      {/* SECCIÓN 3: ESPECIFICACIONES TÉCNICAS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Settings size={16} className="text-amber-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Atributos Técnicos</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Zap size={14} className="text-amber-500" /> Nivel de Tensión (kV)
            </label>
            <input 
              type="text" 
              name="voltageLevel" 
              value={formData.voltageLevel} 
              onChange={handleChange} 
              className="input-field h-11" 
              placeholder="Ej: 115 kV / 13.8 kV" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Globe size={14} className="text-blue-400" /> Coordenadas (Lat, Long)
            </label>
            <input 
              type="text" 
              name="coordinates" 
              value={formData.coordinates} 
              onChange={handleChange} 
              className="input-field h-11 font-mono" 
              placeholder="Ej: 11.6667, -70.2167" 
            />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Breve Descripción / Referencia de Llegada</label>
            <textarea 
              name="description" 
              rows="3" 
              value={formData.description} 
              onChange={handleChange} 
              className="input-field py-4 resize-none" 
              placeholder="Puntos de referencia, accesibilidad o datos adicionales de la infraestructura..." 
            />
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
          className="btn-primary px-8 h-11 shadow-lg shadow-blue-600/20"
        >
          Guardar Registro Sede
        </button>
      </div>
    </form>
  );
}
