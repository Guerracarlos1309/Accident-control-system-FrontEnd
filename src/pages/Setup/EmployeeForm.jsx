import { useState, useMemo } from "react";
import { 
  User, 
  Contact, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  PhoneCall,
  Clock
} from "lucide-react";
import GeographicCascade from "../../components/GeographicCascade";

export default function EmployeeForm({ onCancel }) {
  const [activeTab, setActiveTab] = useState("identity");
  const [formData, setFormData] = useState({
    personalNumber: "", idCard: "", firstName: "", lastName: "",
    email: "", phone: "", gender: "", birthDate: "",
    maritalStatus: "", dominantHand: "", departmentId: "", 
    jobTitleId: "", occupationId: "", birthPlace: "", 
    homeAddress: "", educationLevel: "", hireDate: "", 
    officePhone: "", status: 1
  });

  const [birthGeo, setBirthGeo] = useState({ stateId: "", cityId: "", parish: "" });
  const [homeGeo, setHomeGeo] = useState({ stateId: "", cityId: "", parish: "" });

  // Calculation logic
  const calculateYears = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  };

  const age = useMemo(() => calculateYears(formData.birthDate), [formData.birthDate]);
  const seniority = useMemo(() => calculateYears(formData.hireDate), [formData.hireDate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBirthGeoChange = (geoData) => {
    setBirthGeo({ stateId: geoData.stateId, cityId: geoData.cityId, parish: geoData.parish });
    setFormData(prev => ({ ...prev, birthPlace: geoData.fullText }));
  };

  const handleHomeGeoChange = (geoData) => {
    setHomeGeo({ stateId: geoData.stateId, cityId: geoData.cityId, parish: geoData.parish });
    setFormData(prev => ({ ...prev, homeAddress: geoData.fullText }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, age, seniority };
    console.log("Saving full employee record...", finalData);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
        activeTab === id 
        ? "border-blue-500 text-blue-400 bg-blue-500/5 font-bold" 
        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
      }`}
    >
      <Icon size={16} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Custom Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        <TabButton id="identity" label="Identidad" icon={User} />
        <TabButton id="contact" label="Contacto y Dirección" icon={Contact} />
        <TabButton id="labor" label="Datos Laborales" icon={Briefcase} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB 1: IDENTIDAD */}
        {activeTab === "identity" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombres *</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field h-10" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Apellidos *</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input-field h-10" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cédula *</label>
              <input type="text" name="idCard" required value={formData.idCard} onChange={handleChange} className="input-field h-10" placeholder="Ej: 12.345.678" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">N° Personal *</label>
              <input type="text" name="personalNumber" required value={formData.personalNumber} onChange={handleChange} className="input-field h-10" placeholder="P-XXXXXX" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sexo *</label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">F. Nacimiento</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field h-10" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edad</label>
                <div className="h-10 px-4 flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl text-blue-400 font-bold">
                  {age} años
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 mt-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                 <MapPin size={14} className="text-blue-500" />
                 <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Lugar de Nacimiento</h4>
              </div>
              <GeographicCascade value={birthGeo} onChange={handleBirthGeoChange} />
              <div className="mt-3 text-[10px] text-slate-500 italic">
                Registrado como: <span className="text-slate-300 font-medium">{formData.birthPlace || "Pendiente..."}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACTO Y PERFIL */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correo Personal</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field h-10" placeholder="usuario@ejemplo.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teléfono Personal</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field h-10" placeholder="04XX-XXXXXXX" />
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 mt-2">
              <div className="flex items-center gap-2 mb-4">
                 <MapPin size={14} className="text-emerald-500" />
                 <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Dirección de Habitación</h4>
              </div>
              <GeographicCascade value={homeGeo} onChange={handleHomeGeoChange} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado Civil</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="1">Soltero/a</option>
                <option value="2">Casado/a</option>
                <option value="3">Divorciado/a</option>
                <option value="4">Viudo/a</option>
                <option value="5">Concubinato</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mano Dominante</label>
              <select name="dominantHand" value={formData.dominantHand} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="1">Diestro</option>
                <option value="2">Zurdo</option>
                <option value="3">Ambidiestro</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap size={14} /> Nivel Educativo
              </label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione nivel...</option>
                <option value="primaria">Educación Primaria</option>
                <option value="bachiller">Bachillerato / Educación Media</option>
                <option value="tecnico_medio">Técnico Medio / Especialista</option>
                <option value="tsu">Técnico Superior Universitario (TSU)</option>
                <option value="universitario">Universitario / Licenciatura / Ingeniería</option>
                <option value="especializacion">Postgrado - Especialización</option>
                <option value="maestria">Postgrado - Maestría</option>
                <option value="doctorado">Postgrado - Doctorado</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 3: DATOS LABORALES */}
        {activeTab === "labor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departamento</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="1">Operaciones Eléctricas</option>
                <option value="2">Mantenimiento de Redes</option>
                <option value="3">Distribución</option>
                <option value="4">Administración</option>
                <option value="5">Seguridad e Higiene (ASHO)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
              <select name="jobTitleId" value={formData.jobTitleId} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="1">Técnico Liniero</option>
                <option value="2">Operador de Subestación</option>
                <option value="3">Ingeniero de Planificación</option>
                <option value="4">Analista de Seguridad</option>
                <option value="5">Gerente de Área</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ocupación Específica</label>
              <select name="occupationId" value={formData.occupationId} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800">
                <option value="">Seleccione...</option>
                <option value="1">Personal Operativo</option>
                <option value="2">Personal Administrativo</option>
                <option value="3">Personal Directivo / Confianza</option>
                <option value="4">Contratista Externo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estatus Actual</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field h-10 text-slate-300 [&>option]:bg-slate-800 font-bold text-blue-400">
                <option value="1">Activo</option>
                <option value="2">Inactivo / Retirado</option>
                <option value="3">En Vacaciones</option>
                <option value="4">Reposo Médico</option>
                <option value="5">Suspendido</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 bg-blue-500/5 p-5 rounded-2xl border border-blue-500/10">
               <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                   <Calendar size={14} /> Fecha Ingreso
                 </label>
                 <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="input-field h-10" />
               </div>
               <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} /> Antigüedad
                </label>
                <div className="h-10 px-4 flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl text-emerald-400 font-bold">
                  {seniority} años
                </div>
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <PhoneCall size={14} /> Teléfono Extensión / Oficina
              </label>
              <input type="text" name="officePhone" value={formData.officePhone} onChange={handleChange} className="input-field h-10" placeholder="Ext. XXX o Directo X-XXX-XXXX" />
            </div>
          </div>
        )}

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
            className="btn-primary px-8 h-11 shadow-lg shadow-blue-500/20"
          >
            Finalizar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
