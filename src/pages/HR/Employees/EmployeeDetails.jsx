import { 
  User, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Hash, 
  IdCard, 
  UserCircle,
  GraduationCap
} from "lucide-react";

export default function EmployeeDetails({ data }) {
  if (!data) return <div className="p-8 text-center text-txt-muted font-bold text-sm">Cargando información...</div>;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-bg-main/5 transition-colors group">
      <div className="p-2.5 bg-bg-surface rounded-xl border border-border-main/50 text-txt-muted group-hover:text-corpoelec-blue group-hover:border-corpoelec-blue/30 transition-all">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted mb-1">{label}</p>
        <p className="text-sm font-bold text-txt-main leading-tight">{value || "—"}</p>
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-8 w-1 bg-corpoelec-blue rounded-full shadow-[0_0_8px_rgba(0,103,177,0.3)]"></div>
        <Icon size={16} className="text-corpoelec-blue" />
        <h3 className="text-xs font-black uppercase tracking-widest text-txt-main">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-bg-main/5 p-2 rounded-3xl border border-border-main/30 shadow-inner">
        {children}
      </div>
    </div>
  );

  const getMaritalStatus = (id) => {
    const statuses = { "1": "Soltero/a", "2": "Casado/a", "3": "Divorciado/a", "4": "Viudo/a", "5": "Concubinato" };
    return statuses[id] || "No especificado";
  };

  const getDominantHand = (id) => {
    const hands = { "1": "Diestro", "2": "Zurdo", "3": "Ambidiesto" };
    return hands[id] || "No especificado";
  };

  const getEducationLabel = (val) => {
    const levels = {
      "primaria": "Primaria", "bachiller": "Bachillerato", "tecnico_medio": "Técnico Medio",
      "tsu": "T.S.U.", "universitario": "Universitario / Ing.", "especializacion": "Postgrado",
      "maestria": "Maestría", "doctorado": "Doctorado"
    };
    return levels[val] || val || "No especificado";
  };

  const calculateSeniority = (date) => {
    if (!date) return "—";
    const today = new Date();
    const hire = new Date(date);
    let years = today.getFullYear() - hire.getFullYear();
    const m = today.getMonth() - hire.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < hire.getDate())) years--;
    return `${years} años`;
  };

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border-main">
      {/* Profiler Header */}
      <div className="flex items-center gap-6 p-6 glass-panel rounded-3xl border border-corpoelec-blue/20 bg-gradient-to-br from-corpoelec-blue/5 to-transparent">
        <div className="h-16 w-16 rounded-2xl bg-corpoelec-blue/10 border border-corpoelec-blue/20 flex items-center justify-center text-corpoelec-blue">
          <UserCircle size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-txt-main leading-tight">{data.firstName} {data.lastName}</h2>
          <p className="text-xs font-black uppercase tracking-widest text-txt-muted mt-1">{data.jobTitle?.name || "Cargo no asignado"}</p>
          <div className="flex gap-2 mt-2">
             <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${data.status === 1 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-txt-muted/10 text-txt-muted border border-txt-muted/20'}`}>
               {data.status === 1 ? "Activo" : "Inactivo"}
             </span>
             <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/20">
               Antigüedad: {calculateSeniority(data.hireDate)}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Identidad */}
        <Section title="Información de Identidad" icon={User}>
          <DetailItem icon={Hash} label="Número Personal" value={data.personalNumber} />
          <DetailItem icon={IdCard} label="Cédula de Identidad" value={data.idCard} />
          <DetailItem icon={Calendar} label="Fecha de Nacimiento" value={data.birthDate} />
          <DetailItem icon={User} label="Género" value={data.gender === "M" ? "Masculino" : data.gender === "F" ? "Femenino" : "Otro"} />
          <DetailItem icon={User} label="Estado Civil" value={getMaritalStatus(data.maritalStatus)} />
          <DetailItem icon={User} label="Mano Dominante" value={getDominantHand(data.dominantHand)} />
        </Section>

        {/* Datos Laborales */}
        <Section title="Datos Institucionales" icon={Briefcase}>
          <DetailItem icon={MapPin} label="Departamento" value={data.department?.name} />
          <DetailItem icon={Briefcase} label="Ocupación Específica" value={data.occupation?.name} />
          <DetailItem icon={Calendar} label="Fecha de Ingreso" value={data.hireDate} />
          <DetailItem icon={GraduationCap} label="Nivel Educativo" value={getEducationLabel(data.educationLevel)} />
          <DetailItem icon={Phone} label="Ext. Oficina" value={data.officePhone} />
        </Section>

        {/* Contacto y Ubicación */}
        <Section title="Contacto y Residencia" icon={MapPin}>
          <DetailItem icon={Phone} label="Teléfono Celular" value={data.phone} />
          <DetailItem icon={Mail} label="Correo Electrónico" value={data.email} />
          <DetailItem icon={MapPin} label="Lugar de Nacimiento" value={data.birthPlace} />
          <DetailItem icon={MapPin} label="Dirección de Habitación" value={data.homeAddress} />
        </Section>
      </div>
    </div>
  );
}
