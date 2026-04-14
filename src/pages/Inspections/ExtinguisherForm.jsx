import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Settings,
  Flame,
  Zap
} from "lucide-react";

export default function ExtinguisherForm({ onCancel }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    facilityId: "",
    physicalArea: "",
    extinguisherNumber: "",
    agentType: "PQS",
    impulseType: "directo", // directo | indirecto
    lastRechargeDate: "",
    
    // Checklist: true = Bueno/Sí, false = Malo/No
    locationOk: true,
    signageOk: true,
    demarcationOk: true,
    operationOk: true,
    accessOk: true,
    
    status: "1",
    maintenancePart: "",
    observations: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const toggleCheck = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving technical extinguisher inspection...", formData);
  };

  const ChecklistItem = ({ label, field }) => (
    <div className="flex items-center justify-between p-3.5 bg-slate-900/40 rounded-xl border border-slate-800/60 transition-colors">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="flex bg-slate-800/50 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, [field]: true }))}
          className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
            formData[field] ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Bueno
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, [field]: false }))}
          className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
            !formData[field] ? "bg-red-600 text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Malo
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* SECCIÓN 1: GENERAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <MapPin size={16} className="text-blue-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Localización del Equipo</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Sede / Instalación *</label>
            <select name="facilityId" required value={formData.facilityId} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
              <option value="">Seleccione sede...</option>
              <option value="1">Subestación Coro I</option>
              <option value="2">Planta Josefa Camejo</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Área Ubicada *</label>
            <input type="text" name="physicalArea" required value={formData.physicalArea} onChange={handleChange} className="input-field h-10" placeholder="Ej: Pasillo Administrativo" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha y Hora</label>
            <div className="flex gap-2">
               <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input-field h-10 flex-[2]" />
               <input type="time" name="time" required value={formData.time} onChange={handleChange} className="input-field h-10 flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: TÉCNICA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Settings size={16} className="text-amber-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Especificaciones Técnicas</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nro. de Extintor *</label>
            <input type="text" name="extinguisherNumber" required value={formData.extinguisherNumber} onChange={handleChange} className="input-field h-10 font-mono text-amber-500" placeholder="EXT-XXXX" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Agente Extinguidor</label>
            <select name="agentType" value={formData.agentType} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
              <option value="PQS">PQS (Polvo Químico)</option>
              <option value="CO2">CO2 (Bióxido de Carbono)</option>
              <option value="Agua">Agua Presurizada</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agente Impulsor</label>
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 h-10">
              <button
                type="button"
                onClick={() => setFormData({...formData, impulseType: 'directo'})}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-[9px] font-black uppercase transition-all ${formData.impulseType === 'directo' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
              >
                Directo
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, impulseType: 'indirecto'})}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-[9px] font-black uppercase transition-all ${formData.impulseType === 'indirecto' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
              >
                Indirecto
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Última Recarga</label>
            <input type="date" name="lastRechargeDate" value={formData.lastRechargeDate} onChange={handleChange} className="input-field h-10" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: LISTA DE VERIFICACIÓN */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield size={16} className="text-emerald-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inspección Visual de Seguridad</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ChecklistItem label="Ubicación Correcta" field="locationOk" />
          <ChecklistItem label="Señalización Visible" field="signageOk" />
          <ChecklistItem label="Área Demarcada" field="demarcationOk" />
          <ChecklistItem label="Acceso Libre de Obstrucciones" field="accessOk" />
          <div className="md:col-span-2">
            <ChecklistItem label="Funcionamiento (Manómetro / Precinto)" field="operationOk" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: MANTENIMIENTO */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <AlertCircle size={16} className="text-red-500" />
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Novedades y Mantenimiento</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Parte que requiere mantenimiento</label>
            <select name="maintenancePart" value={formData.maintenancePart} onChange={handleChange} className="input-field h-11 text-slate-300 [&>option]:bg-slate-800">
              <option value="">Ninguna - Operativo</option>
              <option value="manguera">Manguera de Descarga</option>
              <option value="corneta">Corneta / Boquilla</option>
              <option value="manometro">Manómetro (Sin presión)</option>
              <option value="precinto">Precinto de Seguridad (Roto)</option>
              <option value="cilindro">Cilindro (Corrosión/Golpe)</option>
              <option value="valvula">Válvula / Gatillo</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Observaciones Detalladas</label>
            <textarea name="observations" rows="3" value={formData.observations} onChange={handleChange} className="input-field py-3 resize-none" placeholder="Cualquier hallazgo adicional encontrado en la inspección..." />
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
          Guardar Informe Técnico
        </button>
      </div>
    </form>
  );
}
