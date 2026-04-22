import { useState } from "react";
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
} from "lucide-react";
import GeographicCascade from "../../components/GeographicCascade";

export default function AccidentForm({ onCancel }) {
  const [activeTab, setActiveTab] = useState("general");
  const [locationType, setLocationType] = useState("facility");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    facilityId: "",
    accidentTypeId: "",
    description: "",
    inpsaselFile: "",
    affectedProperty: "",
    status: 1,
    damageAgentId: "",
    contactTypeId: "",
    periodId: "",
    customAddressDetails: "",
    activity: "",
    damageAgentType: "",
    medicalCenterName: "",
    medicalCenterAddress: "",
    medicalObservations: "",
    globalObservations: "",
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationChange = (geoData) => {
    setIncidentLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      locationType,
      incidentLocation: locationType === "custom" ? incidentLocation : null,
      medicalLocation,
      witnesses,
    };
    console.log("Saving complete accident record...", finalData);
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
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field h-12"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Clock size={14} /> Hora *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="input-field h-12"
                />
              </div>
            </div>

            <div className="bg-bg-main/5 p-1 rounded-2xl border border-border-main/50 flex gap-1">
              <button
                type="button"
                onClick={() => setLocationType("facility")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "facility" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
              >
                <Home size={16} />
                <span className="text-xs font-black uppercase tracking-widest">En Sede</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationType("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "custom" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
              >
                <MapIcon size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Otra Ubicación</span>
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
                    value={formData.facilityId}
                    onChange={handleChange}
                    className="input-field h-12"
                  >
                    <option value="">Seleccione sede...</option>
                    <option value="1">Subestación Punto Fijo IV</option>
                    <option value="2">Planta Josefa Camejo</option>
                    <option value="3">Oficina Administrativa Coro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Propiedad Afectada
                  </label>
                  <input
                    type="text"
                    name="affectedProperty"
                    value={formData.affectedProperty}
                    onChange={handleChange}
                    className="input-field h-12"
                    placeholder="Ej: Transformador T-1"
                  />
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
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Dirección Detallada / Referencia *
                  </label>
                  <textarea
                    name="customAddressDetails"
                    required
                    rows="3"
                    value={formData.customAddressDetails}
                    onChange={handleChange}
                    className="input-field py-4 resize-none min-h-[100px]"
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
                className="input-field py-4 resize-none min-h-[120px]"
                placeholder="Describa los hechos cronológicamente..."
              />
            </div>
          </div>
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
                  Tipo de Accidente
                </label>
                <select
                  name="accidentTypeId"
                  value={formData.accidentTypeId}
                  onChange={handleChange}
                  className="input-field h-12"
                >
                  <option value="">Seleccione...</option>
                  <option value="1">Caída a un mismo nivel</option>
                  <option value="2">Contacto Eléctrico Directo</option>
                  <option value="3">Atrapamiento</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Agente de Daño (Categoría) *
                </label>
                <select
                  name="damageAgentType"
                  required
                  value={formData.damageAgentType}
                  onChange={handleChange}
                  className="input-field h-12"
                >
                  <option value="">Seleccione...</option>
                  <option value="personal">Personal (Humano)</option>
                  <option value="animal">Animal</option>
                  <option value="cosa">Cosa (Equipo/Herramienta)</option>
                </select>
              </div>
              {formData.damageAgentType === "cosa" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Especificar Objeto
                  </label>
                  <select
                    name="damageAgentId"
                    value={formData.damageAgentId}
                    onChange={handleChange}
                    className="input-field h-12"
                  >
                    <option value="">Seleccione...</option>
                    <option value="1">Herramientas</option>
                    <option value="2">Equipos Eléctricos</option>
                  </select>
                </div>
              )}
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
          <div className="p-16 border-2 border-dashed border-border-main rounded-3xl text-center bg-bg-main/5 animate-in fade-in duration-300">
            <Users size={48} className="mx-auto text-txt-muted/30 mb-6" />
            <p className="text-txt-muted font-black uppercase tracking-tighter text-xs mb-8">
              Administre aquí el personal afectado.
            </p>
            <button type="button" className="btn-secondary h-12 px-8">
              <Plus size={18} /> Agregar Trabajador
            </button>
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
                name="inpsaselFile"
                value={formData.inpsaselFile}
                onChange={handleChange}
                className="input-field h-12"
                placeholder="EX-2024-XXX"
              />
            </div>
            <div className="md:col-span-2 p-8 rounded-3xl border border-corpoelec-blue/20 bg-corpoelec-blue/5">
              <h4 className="text-xs font-black text-corpoelec-blue mb-6 flex items-center gap-2 uppercase tracking-widest">
                <FileText size={20} /> Checklist Documental
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Declaración 24h",
                  "Informe Médico",
                  "Constancia Sede",
                  "Copia Cédula",
                  "Horario Trabajo",
                ].map((doc) => (
                  <label
                    key={doc}
                    className="flex items-center gap-3 text-xs font-bold text-txt-sub cursor-pointer hover:text-txt-main transition-colors p-3 hover:bg-bg-main/5 rounded-xl border border-transparent hover:border-border-main/50"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-border-main bg-bg-surface text-corpoelec-blue focus:ring-corpoelec-blue/50"
                    />
                    {doc}
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
          <button
            type="submit"
            className="btn-primary"
          >
            Guardar Reporte Técnico
          </button>
        </div>
      </form>
    </div>
  );
}
