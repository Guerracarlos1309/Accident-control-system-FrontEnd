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
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
        activeTab === id
          ? "border-blue-500 text-blue-400 bg-blue-500/5 font-bold"
          : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
      }`}
    >
      <Icon size={16} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar">
        <TabButton id="general" label="Gral." icon={Info} />
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field h-11"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Hora *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="input-field h-11"
                />
              </div>
            </div>

            <div className="bg-slate-900/40 p-1 rounded-2xl border border-slate-800/60 flex gap-1">
              <button
                type="button"
                onClick={() => setLocationType("facility")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "facility" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Home size={16} />
                <span className="text-sm font-bold">En Sede</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationType("custom")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "custom" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"}`}
              >
                <MapIcon size={16} />
                <span className="text-sm font-bold">Otra Ubicación</span>
              </button>
            </div>

            {locationType === "facility" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> Sede / Instalación Base *
                  </label>
                  <select
                    name="facilityId"
                    required
                    value={formData.facilityId}
                    onChange={handleChange}
                    className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
                  >
                    <option value="">Seleccione sede...</option>
                    <option value="1">Subestación Punto Fijo IV</option>
                    <option value="2">Planta Josefa Camejo</option>
                    <option value="3">Oficina Administrativa Coro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Propiedad Afectada
                  </label>
                  <input
                    type="text"
                    name="affectedProperty"
                    value={formData.affectedProperty}
                    onChange={handleChange}
                    className="input-field h-11"
                    placeholder="Ej: Transformador T-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/60 bg-blue-500/5">
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-4">
                    Ubicación Geográfica
                  </h4>
                  <GeographicCascade
                    value={incidentLocation}
                    onChange={handleLocationChange}
                    required={true}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Dirección Detallada / Referencia *
                  </label>
                  <textarea
                    name="customAddressDetails"
                    required
                    rows="3"
                    value={formData.customAddressDetails}
                    onChange={handleChange}
                    className="input-field py-3 resize-none"
                    placeholder="Km, sector, torre, etc."
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Descripción del Suceso *
              </label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                className="input-field py-3 resize-none"
                placeholder="Describa los hechos cronológicamente..."
              />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Actividad que realizaba el trabajador *
              </label>
              <textarea
                name="activity"
                required
                rows="3"
                value={formData.activity}
                onChange={handleChange}
                className="input-field py-3 resize-none"
                placeholder="¿Qué estaba haciendo antes del accidente?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Tipo de Accidente
                </label>
                <select
                  name="accidentTypeId"
                  value={formData.accidentTypeId}
                  onChange={handleChange}
                  className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
                >
                  <option value="">Seleccione...</option>
                  <option value="1">Caída a un mismo nivel</option>
                  <option value="2">Contacto Eléctrico Directo</option>
                  <option value="3">Atrapamiento</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Agente de Daño (Categoría) *
                </label>
                <select
                  name="damageAgentType"
                  required
                  value={formData.damageAgentType}
                  onChange={handleChange}
                  className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
                >
                  <option value="">Seleccione...</option>
                  <option value="personal">Personal (Humano)</option>
                  <option value="animal">Animal</option>
                  <option value="cosa">Cosa (Equipo/Herramienta)</option>
                </select>
              </div>
              {formData.damageAgentType === "cosa" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Especificar Objeto
                  </label>
                  <select
                    name="damageAgentId"
                    value={formData.damageAgentId}
                    onChange={handleChange}
                    className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
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
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                  Lista de Testigos
                </h4>
                <button
                  type="button"
                  onClick={addWitness}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2"
                >
                  <UserPlus size={14} /> Agregar Testigo
                </button>
              </div>

              {witnesses.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                  <Users size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm italic">
                    Presione el botón para añadir testigos del suceso.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {witnesses.map((witness, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl animate-in slide-in-from-top-2 duration-200"
                    >
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={witness.name}
                        onChange={(e) =>
                          updateWitness(index, "name", e.target.value)
                        }
                        className="input-field h-10 flex-[2]"
                      />
                      <input
                        type="text"
                        placeholder="Cédula"
                        value={witness.idCard}
                        onChange={(e) =>
                          updateWitness(index, "idCard", e.target.value)
                        }
                        className="input-field h-10 flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={witness.phone}
                        onChange={(e) =>
                          updateWitness(index, "phone", e.target.value)
                        }
                        className="input-field h-10 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeWitness(index)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <Stethoscope size={16} />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">
                  Centro de Salud y Atención
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium text-slate-400">
                    Nombre del Centro de Salud
                  </label>
                  <input
                    type="text"
                    name="medicalCenterName"
                    value={formData.medicalCenterName}
                    onChange={handleChange}
                    className="input-field h-11"
                    placeholder="Ej: Hospital Dr. Rafael Calles Sierra"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 bg-slate-800/20 p-5 rounded-2xl border border-slate-700/30">
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-4">
                    Ubicación del Centro de Salud
                  </p>
                  <GeographicCascade
                    value={medicalLocation}
                    onChange={handleMedicalGeoChange}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium text-slate-400">
                    Observaciones de la Atención / Diagnóstico Preliminar
                  </label>
                  <textarea
                    name="medicalObservations"
                    rows="3"
                    value={formData.medicalObservations}
                    onChange={handleChange}
                    className="input-field py-3 resize-none"
                    placeholder="Especifique qué atención recibió el trabajador..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <AlertCircle size={16} />
                <h4 className="text-[11px] font-bold uppercase tracking-widest">
                  Observaciones Generales del Reporte
                </h4>
              </div>
              <textarea
                name="globalObservations"
                rows="4"
                value={formData.globalObservations}
                onChange={handleChange}
                className="input-field py-3 resize-none shadow-lg shadow-emerald-500/5"
                placeholder="Cualquier información adicional relevante..."
              />
            </div>
          </div>
        )}

        {activeTab === "personnel" && (
          <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center animate-in fade-in duration-300">
            <Users size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 mb-6">
              Administre aquí el personal que resultó afectado el suceso.
            </p>
            <button type="button" className="btn-secondary px-8">
              <Plus size={18} /> Agregar Trabajador
            </button>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Nro. Expediente INPSASEL
              </label>
              <input
                type="text"
                name="inpsaselFile"
                value={formData.inpsaselFile}
                onChange={handleChange}
                className="input-field h-11"
                placeholder="EX-2024-XXX"
              />
            </div>
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 bg-blue-500/5 border-blue-500/20">
              <h4 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                <FileText size={16} /> Checklist de Documentos Obligatorios
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Declaración 24h",
                  "Informe Médico",
                  "Constancia Sede",
                  "Copia Cédula",
                  "Horario Trabajo",
                ].map((doc) => (
                  <label
                    key={doc}
                    className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-slate-200 transition-colors p-2 hover:bg-slate-800/30 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/50"
                    />
                    {doc}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

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
            className="btn-primary px-8 h-11 shadow-lg shadow-blue-500/40"
          >
            Guardar Reporte Técnico
          </button>
        </div>
      </form>
    </div>
  );
}
