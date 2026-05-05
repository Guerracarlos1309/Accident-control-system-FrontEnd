import { useState } from "react";
import { 
  FileText, 
  Stethoscope, 
  Settings2, 
  Files, 
  Activity, 
  ShieldAlert,
  Zap,
  UserCheck
} from "lucide-react";
import MasterEntityManager from "../../../components/MasterEntityManager";

export default function AccidentCatalogs() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Activity },
    { id: "medical", label: "Médico", icon: Stethoscope },
    { id: "technical", label: "Técnico", icon: Settings2 },
    { id: "documentation", label: "Documental", icon: Files }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-12">
            <MasterEntityManager 
              title="Tipos de Incidente" 
              description="Jerarquía de tipos de accidentes (Ej: Caídas, Eléctrico, Tránsito)."
              entityName="Tipo de Accidente" 
              apiPath="/lookups/accident-types"
              fields={[
                { name: "code", label: "Código", required: true },
                { name: "name", label: "Nombre", required: true },
                { name: "description", label: "Descripción" }
              ]}
            />
            <MasterEntityManager 
              title="Magnitudes de Incidente" 
              description="Clasificación por gravedad (Ej: Leve, Grave, Fatal)."
              entityName="Magnitud" 
              apiPath="/lookups/magnitudes"
            />
          </div>
        );
      case "medical":
        return (
          <div className="space-y-12">
            <MasterEntityManager 
              title="Tipos de Lesión" 
              description="Naturaleza de la lesión física sufrida."
              entityName="Tipo de Lesión" 
              apiPath="/lookups/injury-types"
            />
            <MasterEntityManager 
              title="Afectaciones" 
              description="Partes del cuerpo o áreas afectadas."
              entityName="Afectación" 
              apiPath="/lookups/affectations"
            />
             <MasterEntityManager 
              title="Sujetos de Afectación" 
              description="Quién o qué sufrió el daño (Ej: Trabajador, Instalación)."
              entityName="Sujeto" 
              apiPath="/lookups/affectation-subjects"
            />
          </div>
        );
      case "technical":
        return (
          <div className="space-y-12">
            <MasterEntityManager 
              title="Agentes de Daño" 
              description="Elemento que causó directamente el daño (Ej: Herramientas, Electricidad)."
              entityName="Agente" 
              apiPath="/lookups/damage-agents"
            />
            <MasterEntityManager 
              title="Tipos de Contacto" 
              description="Cómo se produjo el contacto con el agente (Ej: Golpeado por, Contacto con)."
              entityName="Tipo de Contacto" 
              apiPath="/lookups/contact-types"
            />
            <MasterEntityManager 
              title="Agentes del Hecho" 
              description="Tipos de agentes involucrados en la inspección."
              entityName="Agente del Hecho" 
              apiPath="/lookups/agent-types"
            />
          </div>
        );
      case "documentation":
        return (
          <div className="space-y-12">
            <MasterEntityManager 
              title="Documentos Requeridos" 
              description="Lista de chequeo de documentos necesarios para el expediente de investigación."
              entityName="Documento" 
              apiPath="/lookups/file-documents"
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
           Configuración Técnica de Seguridad
        </h2>
        <p className="text-txt-muted mt-1 text-xs font-bold uppercase tracking-widest">Gestión de catálogos maestros para la investigación de accidentes.</p>
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
