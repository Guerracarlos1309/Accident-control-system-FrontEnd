import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Info,
  Users,
  FileText,
  Plus,
  Map as MapIcon,
  Home,
  Stethoscope,
  UserPlus,
  Trash2,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  Briefcase,
  User,
} from "lucide-react";
import GeographicCascade from "../../../components/GeographicCascade";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function AccidentForm({ onCancel, onSubmit, initialData }) {
  const [activeTab, setActiveTab] = useState("general");
  const [locationType, setLocationType] = useState("facility");
  const [loading, setLoading] = useState(true);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [showEmployeeCard, setShowEmployeeCard] = useState(null);

  const api = helpFetch();
  const { showNotification } = useNotification();
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => {
        const sanitizedData = { ...prev };
        Object.keys(prev).forEach((key) => {
          if (initialData[key] !== undefined && initialData[key] !== null) {
            sanitizedData[key] = initialData[key];
          } else if (prev[key] === "" || prev[key] === null) {
            sanitizedData[key] = ""; // Mantener como string vacío si es null/undefined
          }
        });

        return {
          ...sanitizedData,
          affectedPersonnel:
            initialData.involvedEmployees?.map((inv) => inv.employee) || [],
          documentsCheck:
            initialData.documentsCheck?.map(
              (doc) => doc.documentId || doc.document_id,
            ) || [],
        };
      });
      setLocationType(initialData.facilityId ? "facility" : "custom");
      if (initialData.witnesses)
        setWitnesses(
          initialData.witnesses.map((w) => ({
            name: w.name || "",
            idCard: w.idCard || "",
            phone: w.phone || "",
          })),
        );

      if (initialData.parish) {
        setIncidentLocation({
          stateId: initialData.parish.city?.stateId || "",
          cityId: initialData.parish.cityId || "",
          parish: initialData.parishId || "",
        });
      }
    }
  }, [initialData]);

  const [catalogs, setCatalogs] = useState({
    facilities: [],
    accidentTypes: [],
    damageAgents: [],
    contactTypes: [],
    periods: [],
    employees: [],
    inspectionStatuses: [],
    managements: [],
  });

  const [formData, setFormData] = useState({
    accidentDate: "",
    accidentTime: "",
    description: "",
    managementId: "",
    inpsaselFileNumber: "",
    facilityId: "",
    accidentTypeId: "",
    periodId: "",
    processStatusId: 1,
    damageAgentId: "",
    contactTypeId: "",
    customAddressDetails: "",
    activity: "",
    medicalCenterName: "",
    medicalCenterAddress: "",
    medicalObservations: "",
    globalObservations: "",
    affectedPersonnel: [],
    documentsCheck: [],
  });

  const [witnesses, setWitnesses] = useState([]);
  const [incidentLocation, setIncidentLocation] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });
  const [medicalLocation, setMedicalLocation] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });

  const [errors, setErrors] = useState({});

  const filteredEmployees =
    employeeSearch.length > 1 && catalogs?.employees
      ? catalogs.employees
          .filter(
            (emp) =>
              `${emp.firstName} ${emp.lastName}`
                .toLowerCase()
                .includes(employeeSearch.toLowerCase()) ||
              emp.personalNumber
                ?.toLowerCase()
                .includes(employeeSearch.toLowerCase()) ||
              emp.idCard?.toLowerCase().includes(employeeSearch.toLowerCase()),
          )
          .filter(
            (emp) =>
              !formData.affectedPersonnel.find(
                (p) => p.personalNumber === emp.personalNumber,
              ),
          )
      : [];

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [
          facilities,
          accidentTypes,
          damageAgents,
          contactTypes,
          periods,
          fileDocuments,
          employees,
          inspectionStatus,
          managements,
        ] = await Promise.all([
          api.get("/facilities"),
          api.get("/lookups/accident-types"),
          api.get("/lookups/damage-agents"),
          api.get("/lookups/contact-types"),
          api.get("/lookups/periods"),
          api.get("/lookups/file-documents"),
          api.get("/employees"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/managements"),
        ]);

        const flatten = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.reduce((acc, item) => {
            acc.push(item);
            if (item.children && item.children.length > 0) {
              acc.push(
                ...item.children.map((c) => ({ ...c, name: `└─ ${c.name}` })),
              );
            }
            return acc;
          }, []);
        };

        setCatalogs({
          facilities: facilities.err
            ? []
            : Array.isArray(facilities)
              ? facilities
              : [],
          accidentTypes: accidentTypes.err ? [] : flatten(accidentTypes),
          damageAgents: damageAgents.err ? [] : flatten(damageAgents),
          contactTypes: contactTypes.err ? [] : flatten(contactTypes),
          periods: periods.err ? [] : Array.isArray(periods) ? periods : [],
          fileDocuments: fileDocuments.err
            ? []
            : Array.isArray(fileDocuments)
              ? fileDocuments
              : [],
          employees: employees.err
            ? []
            : Array.isArray(employees)
              ? employees
              : [],
          inspectionStatuses: inspectionStatus.err
            ? []
            : Array.isArray(inspectionStatus)
              ? inspectionStatus
              : [],
          managements: managements.err
            ? []
            : Array.isArray(managements)
              ? managements
              : [],
        });
      } catch (error) {
        showNotification("Error al cargar catálogos técnicos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accidentDate) newErrors.accidentDate = "Fecha";
    if (!formData.accidentTime) newErrors.accidentTime = "Hora";
    if (locationType === "facility" && !formData.facilityId)
      newErrors.facilityId = "Sede";
    if (!formData.managementId) newErrors.managementId = "Gerencia Involucrada";
    if (
      locationType === "custom" &&
      (!incidentLocation.stateId || !formData.customAddressDetails)
    ) {
      newErrors.location = "Ubicación externa y dirección detallada";
    }
    if (!formData.description) newErrors.description = "Descripción";
    if (!formData.activity) newErrors.activity = "Actividad del trabajador";
    if (!formData.accidentTypeId)
      newErrors.accidentTypeId = "Tipo de accidente";
    if (!formData.damageAgentId) newErrors.damageAgentId = "Agente de daño";
    if (!formData.contactTypeId) newErrors.contactTypeId = "Tipo de contacto";
    if (!formData.periodId) newErrors.periodId = "Periodo/Año";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleLocationChange = (geoData) => {
    setIncidentLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
  };

  const handleMedicalGeoChange = (geoData) => {
    setMedicalLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    setFormData((prev) => ({
      ...prev,
      medicalCenterAddress: geoData.fullText,
    }));
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: "", idCard: "", phone: "" }]);
  };

  const removeWitness = (index) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index, field, value) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index][field] = value;
    setWitnesses(newWitnesses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const currentErrors = {};
      if (!formData.accidentDate) currentErrors.d = "Fecha";
      if (!formData.accidentTime) currentErrors.t = "Hora";
      if (locationType === "facility" && !formData.facilityId)
        currentErrors.f = "Sede";
      if (!formData.managementId) currentErrors.m = "Gerencia";
      if (
        locationType === "custom" &&
        (!incidentLocation.stateId || !formData.customAddressDetails)
      )
        currentErrors.l = "Ubicación Geográfica";
      if (!formData.description) currentErrors.desc = "Descripción";
      if (!formData.activity) currentErrors.act = "Actividad";
      if (!formData.accidentTypeId) currentErrors.at = "Tipo Accidente";
      if (!formData.damageAgentId) currentErrors.da = "Agente Daño";
      if (!formData.contactTypeId) currentErrors.ct = "Tipo Contacto";
      if (!formData.periodId) currentErrors.p = "Periodo";

      const missingNames = Object.values(currentErrors).join(", ");
      showNotification(`Faltan campos obligatorios: ${missingNames}`, "error");
      return;
    }

    const finalData = {
      ...formData,
      locationType,
      incidentLocation: locationType === "custom" ? incidentLocation : null,
      parishId: locationType === "custom" ? incidentLocation.parish : null,
      involvedEmployees: formData.affectedPersonnel.map((p) => ({
        employeeId: p.personalNumber,
      })),
      witnesses,
      documentsCheck: formData.documentsCheck.map((docId) => ({
        documentId: docId,
      })),
    };

    if (onSubmit) {
      await onSubmit(finalData);
    }
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
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
      <div className="flex border-b border-border-main overflow-x-auto no-scrollbar">
        <TabButton id="general" label="General" icon={Info} />
        <TabButton id="details" label="Causa" icon={Shield} />
        <TabButton id="personnel" label="Personal" icon={Users} />
        <TabButton id="medical" label="Testigos/Salud" icon={Stethoscope} />
        <TabButton id="docs" label="Docs" icon={FileText} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
            <p className="text-txt-muted font-black tracking-widest uppercase text-[10px]">
              Cargando catálogos técnicos...
            </p>
          </div>
        ) : (
          activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Calendar size={14} /> Fecha *
                  </label>
                  <input
                    type="date"
                    name="accidentDate"
                    required
                    value={formData.accidentDate}
                    onChange={handleChange}
                    className={`input-field h-12 ${errors.accidentDate ? "border-corpoelec-red" : ""}`}
                  />
                  {errors.accidentDate && (
                    <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                      {errors.accidentDate}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Clock size={14} /> Hora *
                  </label>
                  <input
                    type="time"
                    name="accidentTime"
                    required
                    value={formData.accidentTime}
                    onChange={handleChange}
                    className={`input-field h-12 ${errors.accidentTime ? "border-corpoelec-red" : ""}`}
                  />
                  {errors.accidentTime && (
                    <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                      {errors.accidentTime}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Shield size={14} /> Estado del Proceso *
                  </label>
                  <select
                    name="processStatusId"
                    required
                    value={formData.processStatusId}
                    onChange={handleChange}
                    className="input-field h-12"
                  >
                    {catalogs.inspectionStatuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className={`bg-bg-main/5 p-1 rounded-2xl border border-border-main/50 flex gap-1 ${initialData ? "opacity-50 grayscale pointer-events-none" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setLocationType("facility")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "facility" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                >
                  <Home size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    En Sede
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("custom")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "custom" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                >
                  <MapIcon size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Otra Ubicación
                  </span>
                </button>
              </div>

              {locationType === "facility" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <MapPin size={14} /> Sede / Instalación Base *
                    </label>
                    <select
                      name="facilityId"
                      required
                      disabled={!!initialData}
                      value={formData.facilityId}
                      onChange={handleChange}
                      className={`input-field h-12 ${errors.facilityId ? "border-corpoelec-red" : ""} ${initialData ? "bg-bg-main/5 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Seleccione sede...</option>
                      {catalogs.facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    {errors.facilityId && (
                      <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                        {errors.facilityId}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="p-6 rounded-3xl border border-border-main/50 bg-corpoelec-blue/5">
                    <h4 className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] mb-6">
                      Ubicación Geográfica
                    </h4>
                    <GeographicCascade
                      value={incidentLocation}
                      onChange={handleLocationChange}
                      required={true}
                      disabled={!!initialData}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                      Dirección Detallada / Referencia *
                    </label>
                    <textarea
                      name="customAddressDetails"
                      required
                      disabled={!!initialData}
                      rows="3"
                      value={formData.customAddressDetails}
                      onChange={handleChange}
                      className={`input-field py-4 resize-none min-h-[100px] ${initialData ? "bg-bg-main/5 cursor-not-allowed" : ""}`}
                      placeholder="Km, sector, torre, etc."
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Descripción del Suceso *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className={`input-field py-4 resize-none min-h-[120px] ${errors.description ? "border-corpoelec-red" : ""}`}
                  placeholder="Describa los hechos cronológicamente..."
                />
                {errors.description && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {activeTab === "details" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Actividad que realizaba el trabajador *
              </label>
              <textarea
                name="activity"
                required
                rows="3"
                value={formData.activity}
                onChange={handleChange}
                className="input-field py-4 resize-none min-h-[100px]"
                placeholder="¿Qué estaba haciendo antes del accidente?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Tipo de Accidente *
                </label>
                <select
                  name="accidentTypeId"
                  required
                  value={formData.accidentTypeId}
                  onChange={handleChange}
                  className={`input-field h-12 ${errors.accidentTypeId ? "border-corpoelec-red" : ""}`}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.accidentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.accidentTypeId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.accidentTypeId}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Agente de Daño *
                </label>
                <select
                  name="damageAgentId"
                  required
                  value={formData.damageAgentId}
                  onChange={handleChange}
                  className={`input-field h-12 ${errors.damageAgentId ? "border-corpoelec-red" : ""}`}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.damageAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {errors.damageAgentId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.damageAgentId}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Tipo de Contacto *
                </label>
                <select
                  name="contactTypeId"
                  required
                  value={formData.contactTypeId}
                  onChange={handleChange}
                  className={`input-field h-12 ${errors.contactTypeId ? "border-corpoelec-red" : ""}`}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.contactTypes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.contactTypeId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.contactTypeId}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Período / Jornada *
                </label>
                <select
                  name="periodId"
                  required
                  value={formData.periodId}
                  onChange={handleChange}
                  className={`input-field h-12 ${errors.periodId ? "border-corpoelec-red" : ""}`}
                >
                  <option value="">Seleccione...</option>
                  {catalogs.periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.annuality || p.name}
                    </option>
                  ))}
                </select>
                {errors.periodId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.periodId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em] ml-1">
                  Lista de Testigos
                </h4>
                <button
                  type="button"
                  onClick={addWitness}
                  className="btn-secondary h-10 px-4 text-xs"
                >
                  <UserPlus size={14} /> Registrar Testigo
                </button>
              </div>

              {witnesses.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-border-main rounded-3xl text-center bg-bg-main/5">
                  <Users size={32} className="mx-auto text-txt-muted/50 mb-3" />
                  <p className="text-txt-muted text-[10px] font-black uppercase tracking-widest italic">
                    Sin testigos registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {witnesses.map((witness, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-3 p-4 bg-bg-main/10 border border-border-main/50 rounded-2xl animate-in slide-in-from-top-2 duration-200"
                    >
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={witness.name}
                        onChange={(e) =>
                          updateWitness(index, "name", e.target.value)
                        }
                        className="input-field h-12 flex-[2] bg-bg-surface shadow-none"
                      />
                      <input
                        type="text"
                        placeholder="Cédula"
                        value={witness.idCard}
                        onChange={(e) =>
                          updateWitness(index, "idCard", e.target.value)
                        }
                        className="input-field h-12 flex-1 bg-bg-surface shadow-none"
                      />
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={witness.phone}
                        onChange={(e) =>
                          updateWitness(index, "phone", e.target.value)
                        }
                        className="input-field h-12 flex-1 bg-bg-surface shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeWitness(index)}
                        className="p-3 text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-border-main">
              <div className="flex items-center gap-2 text-corpoelec-blue">
                <Stethoscope size={16} />
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">
                  Atención Médica
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Nombre del Centro de Salud
                  </label>
                  <input
                    type="text"
                    name="medicalCenterName"
                    value={formData.medicalCenterName}
                    onChange={handleChange}
                    className="input-field h-12"
                    placeholder="Ej: Hospital Dr. Rafael Calles Sierra"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 bg-bg-main/5 p-6 rounded-3xl border border-border-main/50">
                  <p className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] mb-6">
                    Ubicación del Centro de Salud
                  </p>
                  <GeographicCascade
                    value={medicalLocation}
                    onChange={handleMedicalGeoChange}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Diagnóstico Preliminar
                  </label>
                  <textarea
                    name="medicalObservations"
                    rows="3"
                    value={formData.medicalObservations}
                    onChange={handleChange}
                    className="input-field py-4 resize-none min-h-[100px]"
                    placeholder="Especifique qué atención recibió el trabajador..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "personnel" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em] ml-1">
                Trabajadores Afectados
              </h4>

              {/* Buscador de Personal */}
              <div className="relative w-full sm:w-72">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="+ Vincular trabajador..."
                    className="input-field h-10 w-full !pl-12 text-[10px] font-black uppercase tracking-widest placeholder:text-txt-muted/50 focus:ring-2 focus:ring-corpoelec-blue/20 transition-all"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                  <Search
                    size={16}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-corpoelec-blue transition-colors"
                  />
                  {employeeSearch && (
                    <button
                      onClick={() => setEmployeeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-corpoelec-red hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Resultados de búsqueda */}
                {filteredEmployees.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-main rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200 no-scrollbar">
                    <div className="p-2 border-b border-border-main bg-bg-main/5">
                      <p className="text-[8px] font-black text-txt-muted uppercase tracking-widest px-2">
                        Resultados ({filteredEmployees.length})
                      </p>
                    </div>
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.personalNumber}
                        type="button"
                        className="w-full text-left p-3 hover:bg-corpoelec-blue/5 flex justify-between items-center group transition-colors"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            affectedPersonnel: [
                              ...formData.affectedPersonnel,
                              emp,
                            ],
                            // Auto-guess Gerencia if not already set
                            managementId:
                              formData.managementId || emp.managementId || "",
                          });
                          setEmployeeSearch("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-bg-main border border-border-main rounded-full flex items-center justify-center font-black text-[10px] text-txt-muted group-hover:text-corpoelec-blue group-hover:border-corpoelec-blue/30 transition-all">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-txt-main group-hover:text-corpoelec-blue transition-colors">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">
                              Personal: {emp.personalNumber}
                            </p>
                          </div>
                        </div>
                        <Plus
                          size={14}
                          className="text-txt-muted group-hover:text-corpoelec-blue opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {employeeSearch.length > 1 &&
                  filteredEmployees.length === 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-main rounded-2xl p-4 shadow-xl text-center">
                      <p className="text-[10px] font-black text-txt-muted uppercase">
                        No se encontró personal
                      </p>
                    </div>
                  )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Briefcase size={14} /> Gerencia responsable *
                </label>
                <select
                  name="managementId"
                  required
                  value={formData.managementId}
                  onChange={handleChange}
                  className={`input-field h-12 ${errors.managementId ? "border-corpoelec-red" : ""}`}
                >
                  <option value="">Seleccione Gerencia...</option>
                  {catalogs.managements.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {errors.managementId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.managementId}
                  </p>
                )}
              </div>
            </div>

            {formData.affectedPersonnel.length === 0 ? (
              <div className="p-20 border-2 border-dashed border-border-main/50 rounded-[2.5rem] text-center bg-bg-main/5 flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-bg-surface border border-border-main rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Users size={36} className="text-txt-muted/20" />
                </div>
                <p className="text-txt-muted font-black uppercase tracking-[0.2em] text-[10px]">
                  No hay personal vinculado a este reporte.
                </p>
                <p className="text-txt-muted/50 text-[9px] font-bold mt-2 uppercase">
                  Utilice el buscador para añadir trabajadores afectados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.affectedPersonnel.map((person) => (
                  <div
                    key={person.personalNumber}
                    className="flex items-center justify-between p-4 bg-bg-surface border border-border-main rounded-3xl shadow-sm hover:shadow-md hover:border-corpoelec-blue/20 transition-all animate-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-corpoelec-blue/5 text-corpoelec-blue border border-corpoelec-blue/10 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner">
                        {person.firstName[0]}
                        {person.lastName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-txt-main uppercase tracking-tight">
                          {person.firstName} {person.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black text-txt-muted uppercase tracking-tighter bg-bg-main px-2 py-0.5 rounded-md border border-border-main">
                            CI: {person.idCard}
                          </span>
                          <span className="text-[9px] font-black text-corpoelec-blue uppercase tracking-tighter bg-corpoelec-blue/5 px-2 py-0.5 rounded-md border border-corpoelec-blue/10">
                            Nro: {person.personalNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setShowEmployeeCard(person)}
                        className="p-3 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-2xl transition-all"
                        title="Ver ficha de personal"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            affectedPersonnel:
                              formData.affectedPersonnel.filter(
                                (p) =>
                                  p.personalNumber !== person.personalNumber,
                              ),
                          })
                        }
                        className="p-3 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "docs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Nro. Expediente INPSASEL
              </label>
              <input
                type="text"
                name="inpsaselFileNumber"
                readOnly
                value={formData.inpsaselFileNumber}
                className="input-field h-12 bg-bg-main/30 cursor-not-allowed italic"
                placeholder="Auto-generado por el sistema..."
              />
              <p className="text-[9px] font-black text-corpoelec-blue uppercase mt-1">
                El sistema asignará el correlativo INP-YYYY-XXXX al guardar.
              </p>
            </div>
            <div className="md:col-span-2 p-8 rounded-3xl border border-corpoelec-blue/20 bg-corpoelec-blue/5">
              <h4 className="text-xs font-black text-corpoelec-blue mb-6 flex items-center gap-2 uppercase tracking-widest">
                <FileText size={20} /> Checklist Documental
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogs.fileDocuments.map((doc) => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all p-4 rounded-2xl border ${
                      formData.documentsCheck.includes(doc.id)
                        ? "bg-corpoelec-blue/10 border-corpoelec-blue text-corpoelec-blue shadow-sm"
                        : "bg-bg-surface border-border-main/50 text-txt-muted hover:border-corpoelec-blue/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.documentsCheck.includes(doc.id)}
                      onChange={(e) => {
                        const newDocs = e.target.checked
                          ? [...formData.documentsCheck, doc.id]
                          : formData.documentsCheck.filter(
                              (id) => id !== doc.id,
                            );
                        setFormData({ ...formData, documentsCheck: newDocs });
                      }}
                      className="w-5 h-5 rounded-lg border-border-main bg-bg-surface text-corpoelec-blue focus:ring-corpoelec-blue/50 cursor-pointer"
                    />
                    {doc.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Guardar Reporte Técnico
          </button>
        </div>

        {/* Mini Card de Personal */}
        {showEmployeeCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-surface w-full max-w-sm rounded-[2.5rem] border border-border-main shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-16 w-16 bg-corpoelec-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-corpoelec-blue/20">
                    <User size={32} />
                  </div>
                  <button
                    onClick={() => setShowEmployeeCard(null)}
                    className="h-8 w-8 rounded-full hover:bg-bg-main flex items-center justify-center text-txt-muted transition-colors"
                  >
                    <Plus size={18} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-lg font-black text-txt-main leading-tight">
                    {showEmployeeCard.firstName} {showEmployeeCard.lastName}
                  </h4>
                  <p className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                    Ficha de Trabajador
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border-main">
                        <Briefcase size={14} className="text-corpoelec-blue" />
                      </div>
                      <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">
                        Datos Institucionales
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-txt-muted uppercase mb-0.5">
                          Gerencia
                        </p>
                        <p className="text-xs font-bold text-txt-main">
                          {showEmployeeCard.management?.name ||
                            "No especificada"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-txt-muted uppercase mb-0.5">
                          Ocupación Específica
                        </p>
                        <p className="text-xs font-bold text-txt-main">
                          {showEmployeeCard.occupation?.name ||
                            "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 text-center">
                      <p className="text-[9px] font-black text-txt-muted uppercase mb-1">
                        Cédula
                      </p>
                      <p className="text-xs font-black text-corpoelec-blue">
                        {showEmployeeCard.idCard}
                      </p>
                    </div>
                    <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 text-center">
                      <p className="text-[9px] font-black text-txt-muted uppercase mb-1">
                        Personal
                      </p>
                      <p className="text-xs font-black text-corpoelec-blue">
                        {showEmployeeCard.personalNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowEmployeeCard(null)}
                className="w-full py-4 bg-bg-main border-t border-border-main text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] hover:text-corpoelec-blue transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
