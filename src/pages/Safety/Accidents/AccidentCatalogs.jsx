import { useState } from "react";
import {
  Activity,
  Stethoscope,
  Settings2,
  Files,
  Building2,
  ShieldAlert,
  Layers,
} from "lucide-react";
import MasterEntityManager from "../../../components/MasterEntityManager";

export default function AccidentCatalogs() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Activity },
    { id: "medical", label: "Médico / Lesiones", icon: Stethoscope },
    { id: "technical", label: "Técnico / Causas", icon: Settings2 },
    { id: "organizational", label: "Organización", icon: Building2 },
    { id: "documentation", label: "Documentos", icon: Files },
  ];

  const renderContent = () => {
    switch (activeTab) {
      /* ─── GENERAL ─────────────────────────────────────── */
      case "general":
        return (
          <div className="space-y-12">
            <MasterEntityManager
              title="Tipos de Accidente"
              description="Clasifica el tipo de accidente registrado en el formulario (Ej: Caída, Eléctrico, Tránsito)."
              entityName="Tipo de Accidente"
              apiPath="/lookups/accident-types"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
            <MasterEntityManager
              title="Magnitudes de Accidente"
              description="Gravedad del accidente (Ej: Leve, Moderado, Grave, Fatal)."
              entityName="Magnitud"
              apiPath="/lookups/magnitudes"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
            <MasterEntityManager
              title="Períodos / Años de Gestión"
              description="Períodos anuales para clasificar y organizar estadísticas de accidentes."
              entityName="Período"
              apiPath="/lookups/periods"
              deleteMode="hard"
              fields={[
                {
                  name: "annuality",
                  label: "Año (Ej: 2026)",
                  type: "number",
                  required: true,
                },
              ]}
            />
          </div>
        );

      /* ─── MÉDICO / LESIONES ────────────────────────────── */
      case "medical":
        return (
          <div className="space-y-12">
            <MasterEntityManager
              title="Tipos de Lesión"
              description="Naturaleza de la lesión física sufrida por el trabajador (Ej: Fractura, Quemadura, Contusión). Se usará en el tab de Personal del formulario."
              entityName="Tipo de Lesión"
              apiPath="/lookups/injury-types"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
            <MasterEntityManager
              title="Centros Médicos"
              description="Centros de salud o clínicas a donde fue trasladado el afectado. Se usará en el tab Médico del formulario."
              entityName="Centro Médico"
              apiPath="/lookups/medical-centers"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre del Centro", required: true },
                { name: "address", label: "Dirección / Ubicación" },
              ]}
            />
          </div>
        );

      /* ─── TÉCNICO / CAUSAS ────────────────────────────── */
      case "technical":
        return (
          <div className="space-y-12">
            <MasterEntityManager
              title="Agentes de Daño"
              description="Elemento que causó directamente el daño (Ej: Herramientas, Electricidad, Maquinaria). Se usará en el tab de Causa del formulario."
              entityName="Agente de Daño"
              apiPath="/lookups/damage-agents"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
            <MasterEntityManager
              title="Tipos de Contacto"
              description="Cómo se produjo el contacto con el agente (Ej: Golpeado por, Contacto con corriente). Se usará en el tab de Causa del formulario."
              entityName="Tipo de Contacto"
              apiPath="/lookups/contact-types"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
            <MasterEntityManager
              title="Estados de Investigación"
              description="Estado en que se encuentra la investigación o inspección del accidente."
              entityName="Estado de Investigación"
              apiPath="/lookups/inspection-status"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre del Estado", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
          </div>
        );

      /* ─── ORGANIZACIÓN ────────────────────────────────── */
      case "organizational":
        return (
          <div className="space-y-12">
            <MasterEntityManager
              title="Gerencias / Departamentos"
              description="Gerencias o unidades organizativas involucradas en el reporte de accidentes."
              entityName="Gerencia"
              apiPath="/lookups/managements"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre de la Gerencia", required: true },
                { name: "description", label: "Descripción" },
              ]}
            />
          </div>
        );

      /* ─── DOCUMENTACIÓN ───────────────────────────────── */
      case "documentation":
        return (
          <div className="space-y-12">
            <MasterEntityManager
              title="Documentos Requeridos"
              description="Lista de documentos necesarios para completar el expediente de investigación de accidente."
              entityName="Documento"
              apiPath="/lookups/file-documents"
              deleteMode="hard"
              fields={[
                { name: "name", label: "Nombre del Documento", required: true },
                { name: "description", label: "Descripción / Instrucciones" },
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-txt-main tracking-tighter flex items-center gap-3">
          <ShieldAlert className="text-corpoelec-red" />
          Configuración de Accidentes
        </h2>
        <p className="text-txt-muted mt-1 text-xs font-bold uppercase tracking-widest">
          Administra los catálogos utilizados en el formulario de registro de
          accidentes.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-corpoelec-blue/5 border border-corpoelec-blue/20">
        <Layers size={18} className="text-corpoelec-blue mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-black text-corpoelec-blue uppercase tracking-wider">
            Catálogos del Formulario
          </p>
          <p className="text-xs text-txt-muted mt-0.5">
            Todos los valores que aparecen en los selectores del formulario de
            accidentes se gestionan aquí. Los cambios se reflejan de inmediato
            en el formulario.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-bg-surface border border-border-main rounded-2xl w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20"
                : "text-txt-muted hover:text-txt-main hover:bg-bg-main"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </div>
    </div>
  );
}
