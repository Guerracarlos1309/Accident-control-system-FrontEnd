import { useState, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Loader2,
  User,
  Clock,
  LayoutGrid,
  List,
} from "lucide-react";
import Modal from "../../../components/Modal";
import AccidentForm from "./AccidentForm";
import AccidentDetails from "./AccidentDetails";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";

export default function AccidentsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'grid' o 'table'
  const [filterStatus, setFilterStatus] = useState(1); // 1: Activos, 0: Archivados

  const api = helpFetch();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const fetchAccidents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accidents");
      if (res && !res.err) {
        setAccidents(Array.isArray(res) ? res : []);
      }
    } catch (error) {
      showNotification("Error al cargar lista de accidentes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

  const handleSaveAccident = async (data) => {
    try {
      const res = await api.post("/accidents", { body: data });
      if (res && !res.err) {
        showNotification("Accidente registrado exitosamente", "success");
        setIsModalOpen(false);
        fetchAccidents();
      } else {
        showNotification(
          res.message || "Error al registrar accidente",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleEdit = async (acc) => {
    if (!acc) return;
    try {
      // Cargamos los detalles completos antes de abrir el form de edición
      // para asegurar que tenemos testigos, documentos y empleados cargados
      const res = await api.get(`/accidents/${acc.id}`);
      if (res && !res.err) {
        setSelectedAccident(res);
        setIsModalOpen(true);
      } else {
        showNotification("Error al cargar detalles para edición", "error");
      }
    } catch (error) {
      showNotification("Error al conectar con el servidor", "error");
    }
  };

  const handleToggleStatus = async (acc) => {
    try {
      const newStatus = acc.status === 1 ? 0 : 1;
      const res = await api.put(`/accidents/${acc.id}`, {
        body: { status: newStatus },
      });
      if (res && !res.err) {
        showNotification(
          `Accidente ${newStatus === 1 ? "activado" : "archivado"}`,
          "success",
        );
        fetchAccidents();
      }
    } catch (error) {
      showNotification("Error al cambiar estado", "error");
    }
  };

  const handleViewDetails = async (acc) => {
    if (!acc) return;
    setSelectedAccident(acc);
    setIsDetailModalOpen(true);

    try {
      const res = await api.get(`/accidents/${acc.id}`);
      if (res && !res.err) {
        setSelectedAccident(res);
      }
    } catch (error) {
      console.error("Error al cargar detalles profundos", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tighter">
            Control de Accidentes
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setFilterStatus(1)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${filterStatus === 1 ? "border-corpoelec-blue text-corpoelec-blue" : "border-transparent text-txt-muted hover:text-txt-main"}`}
            >
              Activos ({accidents.filter((a) => a.status === 1).length})
            </button>
            <button
              onClick={() => setFilterStatus(0)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${filterStatus === 0 ? "border-corpoelec-red text-corpoelec-red" : "border-transparent text-txt-muted hover:text-txt-main"}`}
            >
              Archivados ({accidents.filter((a) => a.status === 0).length})
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selector de Vista */}
          <div className="flex bg-bg-main/50 p-1 rounded-xl border border-border-main/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-bg-surface text-corpoelec-blue shadow-sm" : "text-txt-muted"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-bg-surface text-corpoelec-blue shadow-sm" : "text-txt-muted"}`}
            >
              <List size={18} />
            </button>
          </div>
          {user?.role !== "Analista" && (
            <button
              className="btn-primary flex-1 sm:flex-none"
              onClick={() => {
                setSelectedAccident(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={20} />
              <span>Registrar</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 glass-panel rounded-3xl">
          <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
          <p className="text-txt-muted font-black tracking-widest uppercase text-[10px]">
            Consultando registros...
          </p>
        </div>
      ) : accidents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-border-main/50">
          <div className="h-20 w-20 bg-bg-main/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border-main">
            <Shield size={32} className="text-txt-muted/30" />
          </div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest">
            Sin Accidentes Registrados
          </h3>
          <p className="text-txt-muted mt-2 text-xs italic max-w-xs mx-auto">
            No se han encontrado reportes de investigación en el sistema.
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {accidents
                .filter((a) => a.status === filterStatus)
                .map((acc) => (
                  <div
                    key={acc.id}
                    className={`glass-panel p-6 rounded-3xl border ${acc.status === 1 ? "border-border-main/50" : "border-corpoelec-red/20 opacity-75"} hover:border-corpoelec-blue/30 transition-all group relative overflow-hidden`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 ${acc.status === 1 ? "bg-corpoelec-red/5" : "bg-txt-muted/5"} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}
                    ></div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 ${acc.status === 1 ? "bg-corpoelec-red/10 text-corpoelec-red" : "bg-txt-muted/10 text-txt-muted"} rounded-2xl`}
                        >
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                            ID #{acc.id}
                          </span>
                          <span className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                            Año: {acc.period?.annuality}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {user?.role !== "Analista" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(acc);
                            }}
                            className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(acc);
                          }}
                          className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                        >
                          <Shield size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-bg-main text-txt-main rounded-full flex items-center justify-center border border-border-main">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">
                            Afectado:
                          </p>
                          <p className="text-sm font-bold text-txt-main">
                            {acc.involvedEmployees?.[0]?.employee
                              ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
                              : "No especificado"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border-main/50">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${acc.status === 1 ? "bg-green-500 animate-pulse" : "bg-corpoelec-red"}`}
                            ></span>
                            <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                              {acc.status === 1 ? "Activo" : "Archivado"}
                            </span>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                              acc.processStatusId === 3
                                ? "bg-green-500/10 text-green-500"
                                : acc.processStatusId === 2
                                  ? "bg-corpoelec-blue/10 text-corpoelec-blue"
                                  : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                acc.processStatusId === 3
                                  ? "bg-green-500"
                                  : acc.processStatusId === 2
                                    ? "bg-corpoelec-blue"
                                    : "bg-amber-500"
                              }`}
                            ></span>
                            {acc.processStatus?.name || "Pendiente"}
                          </div>
                        </div>
                        {user?.role !== "Analista" && (
                          <button
                            onClick={() => handleToggleStatus(acc)}
                            className="text-[9px] font-black text-corpoelec-blue uppercase tracking-widest hover:underline"
                          >
                            {acc.status === 1 ? "Archivar" : "Re-activar"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-border-main/50 animate-in fade-in duration-500">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/30 border-b border-border-main">
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      ID
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Fecha
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Estado
                    </th>

                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Afectado
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Codigo
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Tipo de Accidente
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accidents
                    .filter((a) => a.status === filterStatus)
                    .map((acc) => (
                      <tr
                        key={acc.id}
                        className={`border-b border-border-main/50 hover:bg-bg-main/20 transition-colors ${acc.status === 0 ? "opacity-60 bg-bg-main/10" : ""}`}
                      >
                        <td className="p-5 text-xs font-bold text-txt-main">
                          #{acc.id}
                        </td>
                        <td className="p-5 text-xs font-bold text-txt-main">
                          {acc.accidentDate}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${acc.status === 1 ? "bg-green-500/10 text-green-500" : "bg-corpoelec-red/10 text-corpoelec-red"}`}
                            >
                              {acc.status === 1 ? "Activo" : "Archivado"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                                acc.processStatusId === 3
                                  ? "bg-green-500/20 text-green-600"
                                  : acc.processStatusId === 2
                                    ? "bg-corpoelec-blue/20 text-corpoelec-blue"
                                    : "bg-amber-500/20 text-amber-600"
                              }`}
                            >
                              {acc.processStatus?.name || "Pendiente"}
                            </span>
                          </div>
                        </td>

                        <td className="p-5">
                          <span className="text-xs font-bold text-txt-main">
                            {acc.involvedEmployees?.[0]?.employee
                              ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
                              : "---"}
                          </span>
                        </td>

                        <td className="p-5 ">
                          <span className="text-xs font-bold text-txt-main">
                            {acc.inpsaselFileNumber}
                          </span>
                        </td>
                        <td className="p-5 text-xs font-bold text-txt-main  tracking-widest">
                          {acc.type.name}
                        </td>
                        <td className="p-5 text-center flex items-center justify-center gap-2">
                          {user?.role !== "Analista" && (
                            <button
                              onClick={() => handleEdit(acc)}
                              className="p-2 text-txt-muted hover:text-corpoelec-blue transition-all"
                            >
                              <FileText size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(acc)}
                            className="p-2 text-txt-muted hover:text-corpoelec-blue transition-all"
                          >
                            <Shield size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de Registro / Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedAccident ? "Editar Investigación" : "Nueva Investigación"
        }
        maxWidth="max-w-4xl"
        closeOnOutsideClick={false}
      >
        <AccidentForm
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            if (selectedAccident) {
              try {
                const res = await api.put(`/accidents/${selectedAccident.id}`, {
                  body: data,
                });
                if (res && !res.err) {
                  showNotification(
                    "Investigación actualizada exitosamente",
                    "success",
                  );
                  setIsModalOpen(false);
                  fetchAccidents();
                } else {
                  showNotification(
                    res.message || "Error al actualizar",
                    "error",
                  );
                }
              } catch (e) {
                showNotification("Error de conexión", "error");
              }
            } else {
              await handleSaveAccident(data);
            }
          }}
          initialData={selectedAccident}
        />
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha Técnica de Investigación"
        maxWidth="max-w-5xl"
        closeOnOutsideClick={false}
      >
        <AccidentDetails accident={selectedAccident} />
      </Modal>
    </div>
  );
}

// Subcomponent used in the cards
function Shield({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
