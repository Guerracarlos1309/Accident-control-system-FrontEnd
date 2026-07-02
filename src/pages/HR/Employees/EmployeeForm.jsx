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
import {
  validateName,
  validateIdCardNumber,
  validatePersonalNumber,
  validateEmailAddress,
  validatePhoneNumber,
  validateOfficePhoneNumber,
} from "../../../helpers/validationHelper";

// ─── Static mapping: management name keywords → allowed job title IDs & occupation IDs ───
// Job Title IDs: 1-4 = ASHO, 10-14 = Operativo/Campo, 20-23 = Administrativo/Soporte
// Occupation IDs: 1=Directivo, 2=Técnico/Especialista, 3=Operativo/Campo, 4=Administrativo, 5=Supervisor
const MANAGEMENT_FILTER_MAP = [
  {
    // ASHO / Prevención
    keywords: [
      "asho",
      "ambiente",
      "prevenci",
      "protecci",
      "seguridad",
      "higiene",
    ],
    jobTitleIds: [1, 2, 3, 4],
    occupationIds: [1, 2, 4, 5],
  },
  {
    // Operativas / campo
    keywords: [
      "distribuci",
      "transmisi",
      "generaci",
      "vegetaci",
      "mantenimiento",
      "liniero",
      "operaci",
    ],
    jobTitleIds: [10, 11, 12, 13, 14],
    occupationIds: [1, 3, 5],
  },
  {
    // Administrativo / soporte
    keywords: [
      "bienes",
      "servicios",
      "talento",
      "recursos humanos",
      "administra",
      "planificaci",
      "sistemas",
      "tecnolog",
      "finanzas",
      "contabilidad",
      "legal",
      "jur",
    ],
    jobTitleIds: [20, 21, 22, 23],
    occupationIds: [1, 2, 4],
  },
];

export default function EmployeeForm({ data, onCancel, onSubmit }) {
  const [activeTab, setActiveTab] = useState("identity");
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogs, setCatalogs] = useState({
    managements: [],
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
    managementId: "",
    jobTitleId: "",
    occupationId: "",
    customJobTitle: "",
    customOccupation: "",
    birthPlace: "",
    homeAddress: "",
    referencePoint: "",
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

  const [errors, setErrors] = useState({});

  const api = helpFetch();

  const validateField = (name, value) => {
    let result = { isValid: true, message: "" };

    switch (name) {
      case "firstName":
        result = validateName(value, "Nombres", true);
        break;
      case "lastName":
        result = validateName(value, "Apellidos", true);
        break;
      case "idNumber":
        result = validateIdCardNumber(value, true);
        break;
      case "personalNumber":
        result = validatePersonalNumber(value, true);
        break;
      case "email":
        result = validateEmailAddress(value, false);
        break;
      case "phone":
        result = validatePhoneNumber(value, "Teléfono Personal", false);
        break;
      case "officePhone":
        result = validateOfficePhoneNumber(value, false);
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message,
    }));

    return result.isValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleIdNumberBlur = () => {
    const result = validateIdCardNumber(idNumber, true);
    setErrors((prev) => ({
      ...prev,
      idNumber: result.isValid ? "" : result.message,
    }));
  };

  // Load catalogs and sync initial data
  useEffect(() => {
    const initForm = async () => {
      setLoadingCatalogs(true);
      try {
        const [depRes, jobRes, occRes] = await Promise.all([
          api.get("/lookups/managements"),
          api.get("/lookups/job-titles"),
          api.get("/lookups/occupations"),
        ]);

        setCatalogs({
          managements: Array.isArray(depRes) ? depRes : [],
          jobTitles: Array.isArray(jobRes) ? jobRes : [],
          occupations: Array.isArray(occRes) ? occRes : [],
        });

        // If editing, populate data
        if (data) {
          setFormData({
            ...formData,
            ...data,
            managementId: data.managementId?.toString() || "",
            jobTitleId: data.jobTitleId?.toString() || "",
            occupationId: data.occupationId?.toString() || "",
            officePhone: data.officePhone || "",
            referencePoint: data.referencePoint || "",
          });

          if (data.imageUrl) {
            setImagePreview(
              `${window.BACKEND_URL || "http://localhost:3000"}${data.imageUrl}`,
            );
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

          // Sync homeAddress geographic cascade from stored text
          // homeAddress is stored as plain text (e.g. "Parroquia, Ciudad, Estado")
          // We show the stored text but let the user re-select if they want to change it
          if (data.homeAddress) {
            setHomeGeo((prev) => ({ ...prev })); // trigger re-render keeping stored text visible
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

  // ─── Smart filtering based on selected management ───
  const selectedManagementName = useMemo(() => {
    if (!formData.managementId) return "";
    const found = catalogs.managements.find(
      (m) => String(m.id) === String(formData.managementId),
    );
    return found ? found.name.toLowerCase() : "";
  }, [formData.managementId, catalogs.managements]);

  const activeFilter = useMemo(() => {
    if (!selectedManagementName) return null;
    return (
      MANAGEMENT_FILTER_MAP.find((rule) =>
        rule.keywords.some((kw) => selectedManagementName.includes(kw)),
      ) || null
    );
  }, [selectedManagementName]);

  const filteredJobTitles = useMemo(() => {
    if (!activeFilter) return catalogs.jobTitles;
    return catalogs.jobTitles.filter((jt) =>
      activeFilter.jobTitleIds.includes(jt.id),
    );
  }, [activeFilter, catalogs.jobTitles]);

  const filteredOccupations = useMemo(() => {
    if (!activeFilter) return catalogs.occupations;
    return catalogs.occupations.filter((o) =>
      activeFilter.occupationIds.includes(o.id),
    );
  }, [activeFilter, catalogs.occupations]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Numeric validation for personalNumber
    if (name === "personalNumber") {
      if (value !== "" && (!/^\d+$/.test(value) || value.length > 7)) {
        return;
      }
    }

    // Letters only validation for firstName and lastName (allows letters, spaces, and Spanish accents/characters)
    if (name === "firstName" || name === "lastName") {
      if (value !== "" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
        return;
      }
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      // When management changes, reset dependent selects
      if (name === "managementId") {
        updated.jobTitleId = "";
        updated.occupationId = "";
        updated.customJobTitle = "";
        updated.customOccupation = "";
      }
      if (name === "occupationId" && value !== "other") {
        updated.customOccupation = "";
      }
      if (name === "jobTitleId" && value !== "other") {
        updated.customJobTitle = "";
      }
      if (errors[name]) {
        validateField(name, value);
      }
      return updated;
    });
  };

  const handleIdNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Extract digits only
    setIdNumber(val);
    setFormData((prev) => ({ ...prev, idCard: `${idPrefix}-${val}` }));
    if (errors.idNumber) {
      const result = validateIdCardNumber(val, true);
      setErrors((prev) => ({
        ...prev,
        idNumber: result.isValid ? "" : result.message,
      }));
    }
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

    // 1. Manual validation for required fields
    const requiredFields = [
      { key: "firstName", label: "Nombres" },
      { key: "lastName", label: "Apellidos" },
      { key: "personalNumber", label: "N° de Personal" },
      { key: "managementId", label: "Gerencia" },
      { key: "occupationId", label: "Cargo Institucional" },
      { key: "gender", label: "Sexo" },
    ];

    const missingFields = requiredFields.filter((f) => !formData[f.key]);

    if (missingFields.length > 0 || !idNumber) {
      showNotification(
        "Por favor, complete todos los campos obligatorios",
        "error",
      );
      return;
    }

    if (
      formData.occupationId === "other" &&
      !formData.customOccupation?.trim()
    ) {
      showNotification("Por favor, escriba el Cargo Institucional", "error");
      return;
    }


    // Run heuristic validations
    const isFirstNameValid = validateField("firstName", formData.firstName);
    const isLastNameValid = validateField("lastName", formData.lastName);
    const isIdNumberValid = validateField("idNumber", idNumber);
    const isPersonalNumberValid = validateField(
      "personalNumber",
      formData.personalNumber,
    );
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phone", formData.phone);
    const isOfficePhoneValid = validateField(
      "officePhone",
      formData.officePhone,
    );

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isIdNumberValid ||
      !isPersonalNumberValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isOfficePhoneValid
    ) {
      showNotification(
        "No se puede registrar el empleado. Hay campos con datos inválidos o sospechosos.",
        "error",
      );

      // Determine which tab has the first error and switch to it
      if (!isFirstNameValid || !isIdNumberValid || !isPersonalNumberValid) {
        setActiveTab("identity");
      } else if (!isEmailValid || !isPhoneValid) {
        setActiveTab("contact");
      } else if (!isOfficePhoneValid) {
        setActiveTab("labor");
      }
      return;
    }

    // 5. Validate Birth Date (must not be in the future and employee must be >= 18 years old)
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      if (birth > today) {
        showNotification(
          "La fecha de nacimiento no puede ser una fecha futura",
          "error",
        );
        return;
      }
      if (age < 18) {
        showNotification(
          "El empleado debe ser mayor de edad (mínimo 18 años)",
          "error",
        );
        return;
      }
    }

    // 6. Validate Hire Date (must not be in the future and cannot be before the employee turned 18)
    if (formData.hireDate) {
      const hire = new Date(formData.hireDate);
      const today = new Date();
      if (hire > today) {
        showNotification(
          "La fecha de ingreso no puede ser una fecha futura",
          "error",
        );
        return;
      }
      if (formData.birthDate) {
        const birth = new Date(formData.birthDate);
        const minHireDate = new Date(
          birth.getFullYear() + 18,
          birth.getMonth(),
          birth.getDate(),
        );
        if (hire < minHireDate) {
          showNotification(
            "La fecha de ingreso no puede ser anterior a la mayoría de edad del empleado (18 años)",
            "error",
          );
          return;
        }
      }
    }

    // Final sync check
    const finalData = {
      ...formData,
      idCard: `${idPrefix}-${idNumber}`,
      // Send officePhone as null if empty so the backend stores null
      officePhone:
        formData.officePhone && formData.officePhone.trim() !== ""
          ? formData.officePhone.trim()
          : null,
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
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
                {imagePreview ? "Cambiar Fotografía" : "Añadir Fotografía"}
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
                onBlur={handleBlur}
                className={`input-field h-12 uppercase ${errors.firstName ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                maxLength={30}
              />

              {errors.firstName ? (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.firstName}
                </p>
              ) : (
                <div>
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    Debe contener solo letras
                  </p>
                </div>
              )}
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
                onBlur={handleBlur}
                className={`input-field h-12 uppercase ${errors.lastName ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                maxLength={30}
              />
              {errors.lastName ? (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.lastName}
                </p>
              ) : (
                <div>
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    Debe contener solo letras
                  </p>
                </div>
              )}
            </div>

            {/* Cédula Estilizada */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Cédula de Identidad *
              </label>
              <div
                className={`flex items-stretch h-12 rounded-xl overflow-hidden border bg-bg-surface transition-all ${errors.idNumber ? "border-corpoelec-red focus-within:border-corpoelec-red focus-within:ring-corpoelec-red/10" : "border-border-main focus-within:border-corpoelec-blue focus-within:ring-corpoelec-blue/10"}`}
              >
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
                  onBlur={handleIdNumberBlur}
                  className="flex-1 px-4 bg-transparent outline-none text-sm font-semibold text-txt-main placeholder:text-txt-muted/30 uppercase"
                  placeholder="Número de cédula"
                  maxLength={8}
                />
              </div>

              {errors.idNumber ? (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.idNumber}
                </p>
              ) : (
                <div>
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    De 5 a 8 dígitos (Solo dígitos)
                  </p>
                </div>
              )}
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
                onBlur={handleBlur}
                className={`input-field h-12 text-sm font-semibold uppercase ${data ? "bg-bg-main/20 cursor-not-allowed opacity-70" : ""} ${errors.personalNumber ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                placeholder="Numero de personal"
                maxLength={7}
              />
              {data && (
                <p className="text-[9px] text-corpoelec-blue font-black uppercase mt-1 ml-1">
                  El número de personal no se puede modificar una vez registrado
                </p>
              )}
              {!data &&
                (errors.personalNumber ? (
                  <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                    {errors.personalNumber}
                  </p>
                ) : (
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    De 5 a 7 dígitos (Solo dígitos)
                  </p>
                ))}
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
                onBlur={handleBlur}
                className={`input-field h-12 uppercase ${errors.email ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                placeholder="usuario@ejemplo.com"
                maxLength={30}
              />
              {errors.email && (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.email}
                </p>
              )}
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
                onBlur={handleBlur}
                className={`input-field h-12 uppercase ${errors.phone ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                placeholder="04XX-XXXXXXX"
                maxLength={15}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.phone ? (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.phone}
                </p>
              ) : (
                <div>
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    Debe contener solo números
                  </p>
                </div>
              )}
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
              <div className="mt-3 text-[10px] text-txt-muted font-bold uppercase tracking-widest pl-1">
                Registrado como:{" "}
                <span className="text-corpoelec-blue underline decoration-corpoelec-red/30 underline-offset-4">
                  {formData.homeAddress || "Pendiente..."}
                </span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Punto de Referencia (Opcional)
              </label>
              <textarea
                name="referencePoint"
                value={formData.referencePoint || ""}
                onChange={handleChange}
                className="input-field min-h-20 py-3 uppercase"
                placeholder="EJ: CALLE 2 CON AV. 3, CASA NRO. 15-B"
                maxLength={255}
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
                Gerencia
              </label>
              <select
                name="managementId"
                value={formData.managementId}
                onChange={handleChange}
                className="input-field h-12"
                required
              >
                <option value="">
                  {loadingCatalogs ? "Cargando..." : "Seleccione..."}
                </option>
                {catalogs.managements.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
                Cargo Institucional *
              </label>
              <select
                name="occupationId"
                value={formData.occupationId}
                onChange={handleChange}
                className="input-field h-12"
                required
                disabled={!formData.managementId || loadingCatalogs}
              >
                <option value="">
                  {loadingCatalogs
                    ? "Cargando..."
                    : !formData.managementId
                      ? "Seleccione una gerencia primero"
                      : "Seleccione..."}
                </option>
                {filteredOccupations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
                {formData.managementId && !loadingCatalogs && (
                  <option value="other">OTROS (ESPECIFICAR...)</option>
                )}
              </select>
              {formData.occupationId === "other" && (
                <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest ml-1">
                    Escriba el Cargo Institucional *
                  </label>
                  <input
                    type="text"
                    name="customOccupation"
                    required
                    value={formData.customOccupation}
                    onChange={handleChange}
                    className="input-field h-12 font-bold uppercase"
                    placeholder="EJ: JEFE DE DIVISIÓN"
                    maxLength={100}
                  />
                </div>
              )}
              {!formData.managementId && !loadingCatalogs && (
                <p className="text-[9px] text-corpoelec-blue/70 font-bold uppercase tracking-widest mt-1 ml-1">
                  ↑ Seleccione la gerencia para ver los cargos disponibles
                </p>
              )}
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
                <PhoneCall size={14} /> Teléfono Extensión / Oficina
                <span className="text-txt-muted/40 font-normal normal-case tracking-normal">
                  (Opcional)
                </span>
              </label>
              <input
                type="text"
                name="officePhone"
                value={formData.officePhone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field h-12 uppercase ${errors.officePhone ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
                placeholder="Ext. XXX o número directo (máx. 11 dígitos)"
                maxLength={11}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Delete" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.officePhone ? (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.officePhone}
                </p>
              ) : (
                <div>
                  <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                    Opcional · Máximo 11 dígitos numéricos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER PEGAJOSO (SÓLIDO) */}
        <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
          {activeTab !== "identity" && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "labor") setActiveTab("contact");
                else if (activeTab === "contact") setActiveTab("identity");
              }}
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
          >
            Cancelar
          </button>
          {activeTab === "labor" ? (
            <button type="submit" className="btn-primary">
              Finalizar Registro
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "identity") setActiveTab("contact");
                else if (activeTab === "contact") setActiveTab("labor");
              }}
              className="btn-primary"
            >
              Siguiente
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
