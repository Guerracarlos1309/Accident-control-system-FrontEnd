import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Shield,
  Users,
  FileText,
  Stethoscope,
  Info,
  Activity,
  AlertCircle,
  Plus,
  Eye,
  Briefcase,
} from "lucide-react";

export default function AccidentDetails({ accident }) {
  const [showEmployeeCard, setShowEmployeeCard] = useState(null);

  if (!accident) return null;

  const SectionTitle = ({
    icon: Icon,
    title,
    color = "text-corpoelec-blue",
  }) => (
    <div className={`flex items-center gap-2 mb-4 ${color}`}>
      <Icon size={18} />
      <h3 className="text-xs font-black uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );

  const DataRow = ({ label, value }) => (
    <div className="py-2 border-b border-border-main/50 flex justify-between items-center gap-4">
      <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-bold text-txt-main text-right">
        {value || "---"}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4 no-scrollbar">
      {/* Resumen Cabecera */}
      <div className="p-6 bg-corpoelec-blue/5 rounded-3xl border border-corpoelec-blue/10 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 bg-corpoelec-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-corpoelec-blue/20">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-txt-main tracking-tight leading-tight">
              Investigación Técnica #{accident.id}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                <Calendar size={12} /> {accident.accidentDate}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                <Clock size={12} /> {accident.accidentTime}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              accident.status === 1
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-corpoelec-red/10 text-corpoelec-red border-corpoelec-red/20"
            }`}
          >
            {accident.status === 1 ? "Registro Activo" : "Registro Archivado"}
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              accident.processStatusId === 3
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : accident.processStatusId === 2
                  ? "bg-corpoelec-blue/10 text-corpoelec-blue border-corpoelec-blue/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {accident.processStatus?.name || "Pendiente"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Datos de Ubicación */}
        <div className="space-y-6">
          <section>
            <SectionTitle icon={MapPin} title="Ubicación del Suceso" />
            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <DataRow
                label="Instalación"
                value={
                  accident.facility?.name ||
                  (accident.parish
                    ? `${accident.parish.name}, ${accident.parish.city?.name}, ${accident.parish.city?.state?.name}`
                    : "Ubicación Externa")
                }
              />
              <DataRow
                label="Tipo Sede"
                value={
                  accident.facility?.installationType?.name ||
                  "N/A (Ubicación Externa)"
                }
              />
              <DataRow
                label="Detalle Dirección"
                value={
                  accident.customAddressDetails ||
                  accident.facility?.location?.name
                }
              />
            </div>
          </section>

          <section>
            <SectionTitle icon={Info} title="Detalles del Hecho" />
            <div className="glass-panel p-5 rounded-2xl space-y-1">
              <DataRow label="Actividad en curso" value={accident.activity} />
              <DataRow
                label="Gerencia Involucrada"
                value={accident.management?.name}
              />
              <DataRow label="Tipo de Accidente" value={accident.type?.name} />
              <DataRow
                label="Año / Periodo"
                value={accident.period?.annuality}
              />
              <DataRow
                label="Agente de Daño"
                value={accident.damageAgent?.name}
              />
              <DataRow
                label="Tipo de Contacto"
                value={accident.contactType?.name}
              />
            </div>
          </section>
        </div>

        {/* Personal y Salud */}
        <div className="space-y-6">
          <section>
            <SectionTitle
              icon={User}
              title="Personal Involucrado"
              color="text-corpoelec-red"
            />
            <div className="space-y-3">
              {accident.involvedEmployees?.length > 0 ? (
                accident.involvedEmployees.map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-bg-main/20 rounded-2xl border border-border-main/50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-corpoelec-red/10 text-corpoelec-red rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm border border-border-main/50 relative">
                        {inv.employee?.imageUrl ? (
                          <img 
                            src={inv.employee.imageUrl.startsWith('http') 
                              ? inv.employee.imageUrl 
                              : `${window.location.protocol}//${window.location.hostname}:3000/uploads/${inv.employee.imageUrl.replace('uploads/', '')}`} 
                            alt={inv.employee.firstName}
                            className="w-full h-full object-cover"
                            style={{ display: 'block' }}
                            onError={(e) => {
                              e.target.style.display = 'none'; // Oculta la imagen rota
                              e.target.nextSibling.style.display = 'flex'; // Muestra las iniciales
                            }}
                          />
                        ) : null}
                        <span 
                          style={{ display: inv.employee?.imageUrl ? 'none' : 'flex' }}
                          className="w-full h-full items-center justify-center"
                        >
                          {inv.employee?.firstName?.[0]}{inv.employee?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-txt-main uppercase tracking-tight">
                          {inv.employee?.firstName} {inv.employee?.lastName}
                        </p>
                        <p className="text-[9px] font-black text-txt-muted uppercase">
                          CI: {inv.employee?.idCard || inv.employee?.id_card}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEmployeeCard(inv.employee)}
                      className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-txt-muted italic ml-1">
                  No se registró personal específico.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle
              icon={Users}
              title="Testigos"
              color="text-amber-500"
            />
            <div className="space-y-3">
              {accident.witnesses?.length > 0 ? (
                accident.witnesses.map((witness, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center font-black text-[10px]">
                        W{idx + 1}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-txt-main">
                          {witness.name}
                        </p>
                        <p className="text-[9px] font-black text-txt-muted uppercase">
                          CI: {witness.idCard || "---"} | Tel:{" "}
                          {witness.phone || "---"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-txt-muted italic ml-1">
                  No se registraron testigos.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <SectionTitle
            icon={Stethoscope}
            title="Diagnóstico / Salud"
            color="text-green-500"
          />
          <div className="glass-panel p-5 rounded-2xl space-y-1">
            <DataRow label="Centro Médico" value={accident.medicalCenterName} />
            <div className="mt-4">
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest mb-2">
                Observaciones Médicas
              </p>
              <p className="text-xs text-txt-main leading-relaxed bg-bg-main/30 p-3 rounded-xl italic">
                "
                {accident.medicalObservations ||
                  "Sin observaciones registradas."}
                "
              </p>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle
            icon={FileText}
            title="Checklist Documental"
            color="text-corpoelec-blue"
          />
          <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 gap-2">
            {accident.documentsCheck?.length > 0 ? (
              accident.documentsCheck.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs font-bold text-txt-main"
                >
                  <div className="h-4 w-4 bg-corpoelec-blue rounded flex items-center justify-center text-white">
                    <Plus size={10} />
                  </div>
                  {doc.document?.name || "Documento vinculado"}
                </div>
              ))
            ) : (
              <p className="text-xs text-txt-muted italic">
                No hay documentos marcados.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Descripción Técnica */}
      <section>
        <SectionTitle
          icon={FileText}
          title="Descripción Técnica de los Hechos"
        />
        <div className="glass-panel p-6 rounded-3xl bg-bg-main/10 border-border-main/50">
          <p className="text-sm text-txt-main leading-relaxed whitespace-pre-line">
            {accident.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {accident.inpsaselFileNumber && (
              <div className="flex items-center gap-2 p-3 bg-corpoelec-blue/5 rounded-xl border border-corpoelec-blue/10 w-fit">
                <AlertCircle size={14} className="text-corpoelec-blue" />
                <span className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                  Expediente INPSASEL: {accident.inpsaselFileNumber}
                </span>
              </div>
            )}
            {accident.globalObservations && (
              <div className="flex items-center gap-2 p-3 bg-bg-main/20 rounded-xl border border-border-main/50 w-fit">
                <Info size={14} className="text-txt-muted" />
                <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">
                  Obs. Globales: {accident.globalObservations}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

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
                        {showEmployeeCard.management?.name || "No especificada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-txt-muted uppercase mb-0.5">
                        Ocupación Específica
                      </p>
                      <p className="text-xs font-bold text-txt-main">
                        {showEmployeeCard.occupation?.name || "No especificado"}
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
                      {showEmployeeCard.idCard || showEmployeeCard.id_card}
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
    </div>
  );
}
