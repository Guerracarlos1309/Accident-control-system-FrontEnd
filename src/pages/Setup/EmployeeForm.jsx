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
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
        activeTab === id 
        ? "border-corpoelec-blue text-corpoelec-blue bg-corpoelec-blue/5 font-black uppercase tracking-tighter" 
        : "border-transparent text-txt-muted hover:text-txt-main hover:bg-bg-main/5 font-bold uppercase tracking-tighter"
      }`}
    >
      <Icon size={18} />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Custom Tabs */}
      <div className="flex border-b border-border-main overflow-x-auto no-scrollbar">
        <TabButton id="identity" label="Identidad" icon={User} />
        <TabButton id="contact" label="Contacto y Dirección" icon={Contact} />
        <TabButton id="labor" label="Datos Laborales" icon={Briefcase} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TAB 1: IDENTIDAD */}
        {activeTab === "identity" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Nombres *</label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field h-12" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Apellidos *</label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input-field h-12" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Cédula *</label>
              <input type="text" name="idCard" required value={formData.idCard} onChange={handleChange} className="input-field h-12" placeholder="Ej: 12.345.678" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">N° Personal *</label>
              <input type="text" name="personalNumber" required value={formData.personalNumber} onChange={handleChange} className="input-field h-12" placeholder="P-XXXXXX" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Sexo *</label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">F. Nacimiento</label>
                <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field h-12" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Edad Actual</label>
                <div className="h-12 px-4 flex items-center bg-bg-main/5 border border-border-main/50 rounded-xl text-txt-main font-black">
                  {age} años
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-border-main/50 mt-4 bg-bg-main/5">
              <div className="flex items-center gap-2 mb-6">
                 <MapPin size={16} className="text-corpoelec-blue" />
                 <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">Lugar de Nacimiento</h4>
              </div>
              <GeographicCascade value={birthGeo} onChange={handleBirthGeoChange} />
              <div className="mt-3 text-[10px] text-txt-muted font-bold uppercase tracking-widest pl-1">
                Registrado como: <span className="text-corpoelec-blue underline decoration-corpoelec-red/30 underline-offset-4">{formData.birthPlace || "Pendiente..."}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACTO Y PERFIL */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Correo Personal</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field h-12" placeholder="usuario@ejemplo.com" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Teléfono Personal</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field h-12" placeholder="04XX-XXXXXXX" />
            </div>
            
            <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-border-main/50 mt-2 bg-bg-main/5">
              <div className="flex items-center gap-2 mb-6">
                 <MapPin size={16} className="text-corpoelec-blue" />
                 <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">Dirección de Habitación</h4>
              </div>
              <GeographicCascade value={homeGeo} onChange={handleHomeGeoChange} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Estado Civil</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="1">Soltero/a</option>
                <option value="2">Casado/a</option>
                <option value="3">Divorciado/a</option>
                <option value="4">Viudo/a</option>
                <option value="5">Concubinato</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Mano Dominante</label>
              <select name="dominantHand" value={formData.dominantHand} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="1">Diestro</option>
                <option value="2">Zurdo</option>
                <option value="3">Ambidiestro</option>
              </select>
            </div>
            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <GraduationCap size={14} /> Nivel Educativo
              </label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field h-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Departamento</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="1">Operaciones Eléctricas</option>
                <option value="2">Mantenimiento de Redes</option>
                <option value="3">Distribución</option>
                <option value="4">Administración</option>
                <option value="5">Seguridad e Higiene (ASHO)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Cargo Institucional</label>
              <select name="jobTitleId" value={formData.jobTitleId} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="1">Técnico Liniero</option>
                <option value="2">Operador de Subestación</option>
                <option value="3">Ingeniero de Planificación</option>
                <option value="4">Analista de Seguridad</option>
                <option value="5">Gerente de Área</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Ocupación Específica</label>
              <select name="occupationId" value={formData.occupationId} onChange={handleChange} className="input-field h-12">
                <option value="">Seleccione...</option>
                <option value="1">Personal Operativo</option>
                <option value="2">Personal Administrativo</option>
                <option value="3">Personal Directivo / Confianza</option>
                <option value="4">Contratista Externo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Estatus Actual</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field h-12 font-black text-corpoelec-blue">
                <option value="1">Activo</option>
                <option value="2">Inactivo / Retirado</option>
                <option value="3">En Vacaciones</option>
                <option value="4">Reposo Médico</option>
                <option value="5">Suspendido</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 col-span-1 md:col-span-2 bg-corpoelec-blue/5 p-6 rounded-3xl border border-corpoelec-blue/20">
               <div className="space-y-1">
                 <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                   <Calendar size={14} /> Fecha Ingreso
                 </label>
                 <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} className="input-field h-12" />
               </div>
               <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                  <Clock size={14} /> Antigüedad Laboral
                </label>
                <div className="h-12 px-4 flex items-center bg-bg-surface border border-border-main/50 rounded-xl text-txt-main font-black">
                  {seniority} años
                </div>
              </div>
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <PhoneCall size={14} /> Teléfono Extensión / Oficina
              </label>
              <input type="text" name="officePhone" value={formData.officePhone} onChange={handleChange} className="input-field h-12" placeholder="Ext. XXX o Directo X-XXX-XXXX" />
            </div>
          </div>
        )}

        {/* FOOTER PEGAJOSO (SÓLIDO) */}
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
            Finalizar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
