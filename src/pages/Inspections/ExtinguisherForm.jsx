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
    <div className="flex items-center justify-between p-4 bg-bg-main/5 rounded-2xl border border-border-main/50 transition-colors">
      <span className="text-xs font-bold text-txt-main">{label}</span>
      <div className="flex bg-bg-surface rounded-xl p-1 border border-border-main">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, [field]: true }))}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
            formData[field] ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"
          }`}
        >
          Bueno
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, [field]: false }))}
          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
            !formData[field] ? "bg-corpoelec-red text-white shadow-lg shadow-corpoelec-red/20" : "text-txt-muted hover:text-txt-main"
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
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <MapPin size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Localización del Equipo</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Sede / Instalación *</label>
            <select name="facilityId" required value={formData.facilityId} onChange={handleChange} className="input-field h-12">
              <option value="">Seleccione sede...</option>
              {/* Note: In a real scenario these would come from lookups */}
              <option value="1">Subestación Coro I</option>
              <option value="2">Planta Josefa Camejo</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Área Ubicada *</label>
            <input type="text" name="physicalArea" required value={formData.physicalArea} onChange={handleChange} className="input-field h-12" placeholder="Ej: Pasillo Administrativo" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Fecha y Hora</label>
            <div className="flex gap-2">
               <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input-field h-12 flex-[2]" />
               <input type="time" name="time" required value={formData.time} onChange={handleChange} className="input-field h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: TÉCNICA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Settings size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Ficha Técnica</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Nro. de Extintor *</label>
            <input type="text" name="extinguisherNumber" required value={formData.extinguisherNumber} onChange={handleChange} className="input-field h-12 font-bold text-corpoelec-blue" placeholder="EXT-XXXX" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Agente Extinguidor</label>
            <select name="agentType" value={formData.agentType} onChange={handleChange} className="input-field h-12">
              <option value="PQS">PQS (Polvo Químico)</option>
              <option value="CO2">CO2 (Bióxido de Carbono)</option>
              <option value="Agua">Agua Presurizada</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Agente Impulsor</label>
            <div className="flex bg-bg-main/5 p-1 rounded-xl border border-border-main h-12">
              <button
                type="button"
                onClick={() => setFormData({...formData, impulseType: 'directo'})}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.impulseType === 'directo' ? 'bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20' : 'text-txt-muted hover:text-txt-main'}`}
              >
                Directo
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, impulseType: 'indirecto'})}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.impulseType === 'indirecto' ? 'bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20' : 'text-txt-muted hover:text-txt-main'}`}
              >
                Indirecto
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Última Recarga</label>
            <input type="date" name="lastRechargeDate" value={formData.lastRechargeDate} onChange={handleChange} className="input-field h-12" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: LISTA DE VERIFICACIÓN */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <Shield size={16} className="text-corpoelec-blue" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Inspección Visual</h4>
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
        <div className="flex items-center gap-2 pb-2 border-b border-border-main">
          <AlertCircle size={16} className="text-corpoelec-red" />
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">Novedades y Mantenimiento</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Parte que requiere mantenimiento</label>
            <select name="maintenancePart" value={formData.maintenancePart} onChange={handleChange} className="input-field h-12">
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
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Observaciones Detalladas</label>
            <textarea name="observations" rows="3" value={formData.observations} onChange={handleChange} className="input-field py-4 resize-none min-h-[100px]" placeholder="Cualquier hallazgo adicional..." />
          </div>
        </div>
      </div>

      {/* FOOTER PEGAJOSO */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary"
        >
          Guardar Informe Técnico
        </button>
      </div>
    </form>
  );
}
