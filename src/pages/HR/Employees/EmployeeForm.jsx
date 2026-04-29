import { useState, useMemo, useEffect, useRef } from "react";
import {
  User,
  Contact,
  Briefcase,
  MapPin,
  GraduationCap,
  Calendar,
  PhoneCall,
  Clock,
  Camera,
} from "lucide-react";
import GeographicCascade from "../../../components/GeographicCascade";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function EmployeeForm({ data, onCancel, onSubmit }) {
  const [activeTab, setActiveTab] = useState("identity");
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogs, setCatalogs] = useState({
    departments: [],
    jobTitles: [],
    occupations: [],
  });

  const [formData, setFormData] = useState({
    personalNumber: "",
    idCard: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: "",
    maritalStatus: "",
    dominantHand: "",
    departmentId: "",
    jobTitleId: "",
    occupationId: "",
    birthPlace: "",
    homeAddress: "",
    educationLevel: "",
    hireDate: "",
    officePhone: "",
    status: 1,
  });

  const [idPrefix, setIdPrefix] = useState("V");
  const [idNumber, setIdNumber] = useState("");
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const api = helpFetch();

  // Load catalogs and sync initial data
  useEffect(() => {
    const initForm = async () => {
      setLoadingCatalogs(true);
      try {
        const [depRes, jobRes, occRes] = await Promise.all([
          api.get("/lookups/departments"),
          api.get("/lookups/job-titles"),
          api.get("/lookups/occupations"),
        ]);

        setCatalogs({
          departments: Array.isArray(depRes) ? depRes : [],
          jobTitles: Array.isArray(jobRes) ? jobRes : [],
          occupations: Array.isArray(occRes) ? occRes : [],
        });

        // If editing, populate data
        if (data) {
          setFormData({
            ...formData,
            ...data,
            departmentId: data.departmentId?.toString() || "",
            jobTitleId: data.jobTitleId?.toString() || "",
            occupationId: data.occupationId?.toString() || "",
          });
          
          if (data.imageUrl) {
            setImagePreview(`http://localhost:3000${data.imageUrl}`);
          }

          // Sync ID Card prefix and number
          if (data.idCard && typeof data.idCard === "string") {
            if (data.idCard.includes("-")) {
              const [pref, num] = data.idCard.split("-");
              setIdPrefix(pref);
              setIdNumber(num);
            } else {
              // Fallback if no hyphen
              setIdNumber(data.idCard.replace(/\D/g, ""));
            }
          }
        }
      } catch (error) {
        console.error("Error loading form dependencies", error);
      } finally {
        setLoadingCatalogs(false);
      }
    };

    initForm();
  }, [data]);

  const [birthGeo, setBirthGeo] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });
  const [homeGeo, setHomeGeo] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });

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

  const age = useMemo(
    () => calculateYears(formData.birthDate),
    [formData.birthDate],
  );
  const seniority = useMemo(
    () => calculateYears(formData.hireDate),
    [formData.hireDate],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Numeric validation for personalNumber
    if (name === "personalNumber" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleIdNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Extract digits only
    setIdNumber(val);
    setFormData((prev) => ({ ...prev, idCard: `${idPrefix}-${val}` }));
  };

  const handleIdPrefixChange = (e) => {
    const pref = e.target.value;
    setIdPrefix(pref);
    setFormData((prev) => ({ ...prev, idCard: `${pref}-${idNumber}` }));
  };

  const handleBirthGeoChange = (geoData) => {
    setBirthGeo({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    setFormData((prev) => ({ ...prev, birthPlace: geoData.fullText }));
  };

  const handleHomeGeoChange = (geoData) => {
    setHomeGeo({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    setFormData((prev) => ({ ...prev, homeAddress: geoData.fullText }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { showNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Manual validation for required fields
    const requiredFields = [
      { key: "firstName", label: "Nombres" },
      { key: "lastName", label: "Apellidos" },
      { key: "personalNumber", label: "N° de Personal" },
      { key: "departmentId", label: "Departamento" },
      { key: "jobTitleId", label: "Cargo Institucional" },
      { key: "occupationId", label: "Ocupación" },
      { key: "gender", label: "Sexo" },
    ];

    const missingFields = requiredFields.filter((f) => !formData[f.key]);

    if (missingFields.length > 0 || !idNumber) {
      showNotification("Por favor, complete todos los campos", "error");
      return;
    }

    // Final sync check
    const finalData = {
      ...formData,
      idCard: `${idPrefix}-${idNumber}`,
    };
    
    const formDataToSend = new FormData();
    Object.keys(finalData).forEach((key) => {
      if (finalData[key] !== null && finalData[key] !== undefined) {
        formDataToSend.append(key, finalData[key]);
      }
    });
    
    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }
    
    onSubmit(formDataToSend);
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
            {/* Image Upload */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-6 mb-2">
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-bg-surface shadow-xl shadow-corpoelec-blue/10 bg-bg-main/5 group cursor-pointer flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-txt-muted/30" />
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-corpoelec-blue hover:text-corpoelec-blue/80 transition-colors"
              >
                {imagePreview ? 'Cambiar Fotografía' : 'Añadir Fotografía'}
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Nombres *
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="input-field h-12"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="input-field h-12"
              />
            </div>

            {/* Cédula Estilizada */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Cédula de Identidad *
              </label>
              <div className="flex items-stretch h-12 rounded-xl overflow-hidden border border-border-main focus-within:border-corpoelec-blue focus-within:ring-4 focus-within:ring-corpoelec-blue/10 bg-bg-surface transition-all">
                <select
                  value={idPrefix}
                  onChange={handleIdPrefixChange}
                  className="bg-bg-main/5 px-4 font-black text-corpoelec-blue text-xs border-r border-border-main outline-none cursor-pointer hover:bg-bg-main/10 transition-colors"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                </select>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={handleIdNumberChange}
                  className="flex-1 px-4 bg-transparent outline-none text-sm font-semibold text-txt-main placeholder:text-txt-muted/30"
                  placeholder="Número de cédula"
                />
              </div>
            </div>

            {/* N° Personal Estilizado */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                N° de Personal *
              </label>
              <input
                type="text"
                name="personalNumber"
                required
                disabled={!!data}
                value={formData.personalNumber}
                onChange={handleChange}
                className={`input-field h-12 text-sm font-semibold ${data ? "bg-bg-main/20 cursor-not-allowed opacity-70" : ""}`}
                placeholder="Numero de personal"
              />
              {data && (
                <p className="text-[9px] text-corpoelec-blue font-black uppercase mt-1 ml-1">
                  El número de personal no se puede modificar una vez registrado
                </p>
              )}
              {!data && (
                <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                  Solo dígitos permitidos
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Sexo *
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="input-field h-12"
              >
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                  F. Nacimiento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="input-field h-12"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                  Edad Actual
                </label>
                <div className="h-12 px-4 flex items-center bg-bg-main/5 border border-border-main/50 rounded-xl text-txt-main font-black">
                  {age} años
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-border-main/50 mt-4 bg-bg-main/5">
              <div className="flex items-center gap-2 mb-6">
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">
                  Lugar de Nacimiento
                </h4>
              </div>
              <GeographicCascade
                value={birthGeo}
                onChange={handleBirthGeoChange}
              />
              <div className="mt-3 text-[10px] text-txt-muted font-bold uppercase tracking-widest pl-1">
                Registrado como:{" "}
                <span className="text-corpoelec-blue underline decoration-corpoelec-red/30 underline-offset-4">
                  {formData.birthPlace || "Pendiente..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTACTO Y PERFIL */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Correo Personal
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field h-12"
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Teléfono Personal
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field h-12"
                placeholder="04XX-XXXXXXX"
              />
            </div>

            <div className="col-span-1 md:col-span-2 p-6 rounded-3xl border border-border-main/50 mt-2 bg-bg-main/5">
              <div className="flex items-center gap-2 mb-6">
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">
                  Dirección de Habitación
                </h4>
              </div>
              <GeographicCascade
                value={homeGeo}
                onChange={handleHomeGeoChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Estado Civil
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="input-field h-12"
              >
                <option value="">Seleccione...</option>
                <option value="1">Soltero/a</option>
                <option value="2">Casado/a</option>
                <option value="3">Divorciado/a</option>
                <option value="4">Viudo/a</option>
                <option value="5">Concubinato</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Mano Dominante
              </label>
              <select
                name="dominantHand"
                value={formData.dominantHand}
                onChange={handleChange}
                className="input-field h-12"
              >
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
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className="input-field h-12"
              >
                <option value="">Seleccione nivel...</option>
                <option value="primaria">Educación Primaria</option>
                <option value="bachiller">
                  Bachillerato / Educación Media
                </option>
                <option value="tecnico_medio">
                  Técnico Medio / Especialista
                </option>
                <option value="tsu">
                  Técnico Superior Universitario (TSU)
                </option>
                <option value="universitario">
                  Universitario / Licenciatura / Ingeniería
                </option>
                <option value="especializacion">
                  Postgrado - Especialización
                </option>
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
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Departamento
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="input-field h-12"
                required
              >
                <option value="">
                  {loadingCatalogs ? "Cargando..." : "Seleccione..."}
                </option>
                {catalogs.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Cargo Institucional
              </label>
              <select
                name="jobTitleId"
                value={formData.jobTitleId}
                onChange={handleChange}
                className="input-field h-12"
                required
              >
                <option value="">
                  {loadingCatalogs ? "Cargando..." : "Seleccione..."}
                </option>
                {catalogs.jobTitles.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Ocupación Específica
              </label>
              <select
                name="occupationId"
                value={formData.occupationId}
                onChange={handleChange}
                className="input-field h-12"
                required
              >
                <option value="">
                  {loadingCatalogs ? "Cargando..." : "Seleccione..."}
                </option>
                {catalogs.occupations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Estatus Actual
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field h-12 font-black text-corpoelec-blue"
              >
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
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="input-field h-12"
                />
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
                Teléfono Extensión / Oficina
              </label>
              <input
                type="text"
                name="officePhone"
                value={formData.officePhone}
                onChange={handleChange}
                className="input-field h-12"
                placeholder="Ext. XXX o Directo X-XXX-XXXX"
              />
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
          <button type="submit" className="btn-primary">
            Finalizar Registro
          </button>
        </div>
      </form>
    </div>
  );
}
