import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Calendar,
  User,
  MapPin,
  Shield,
  Eye,
  Pencil,
  Info,
} from "lucide-react";
import Modal from "../../../../components/Modal";
import ExtinguisherForm from "./ExtinguisherForm";
import ExtinguisherInspectionDetails from "./ExtinguisherInspectionDetails";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";
import { useAuth } from "../../../../context/AuthContext";

export default function ExtinguisherManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
  const api = helpFetch();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/inspections");
      if (res && !res.err) {
        const extinguisherInspections = res.filter(
          (i) => i.type === "Extintor" || i.extinguisherInspection,
        );
        setInspections(extinguisherInspections);
      } else {
        showNotification(
          "Error al cargar historial de inspecciones de extintores",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión al servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleViewDetails = (id) => {
    setSelectedInspectionId(id);
    setIsDetailModalOpen(true);
  };

  const handleEdit = async (id) => {
    setIsFetchingEdit(id);
    try {
      const res = await api.get(`/inspections/${id}`);
      if (res && !res.err) {
        setInitialData(res);
        setIsModalOpen(true);
      } else {
        showNotification(
          "No se pudo cargar la información para editar",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión al intentar editar", "error");
    } finally {
      setIsFetchingEdit(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialData(null);
  };

  return (
    <div className="space-y-6 text-txt-main">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tighter">
            Inspección de Extintores
          </h2>
          <p className="text-txt-muted mt-1 text-sm md:text-base">
            Mantenimiento y estado preventivo de la red de equipos de extinción
            de incendios.
          </p>
        </div>
        {user?.role !== "Analista" && (
          <button
            className="btn-primary w-full sm:w-auto shadow-lg shadow-corpoelec-blue/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            <span>Registrar Inspección</span>
          </button>
        )}
      </div>

      {/* TABLE/GRID SECTION */}
      <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
        {loading && inspections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
            <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Buscando auditorías registradas...
            </p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-20 text-txt-muted">
            <div className="w-16 h-16 bg-bg-main/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-main">
              <Shield size={32} className="text-txt-muted" />
            </div>
            <p className="font-bold uppercase tracking-widest text-xs">
              No hay auditorías de extintores registradas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                  <th className="px-8 py-5">Fecha e Informe</th>
                  <th className="px-8 py-5">Código Inspección</th>
                  <th className="px-8 py-5">Inspector</th>
                  <th className="px-8 py-5">Sede / Centro</th>
                  <th className="px-8 py-5 text-center">Estado Global</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/20">
                {inspections.map((insp) => (
                  <tr
                    key={insp.id}
                    className="hover:bg-bg-main/5 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(insp.id)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-txt-main flex items-center gap-2">
                          <Calendar size={14} className="text-corpoelec-blue" />
                          {new Date(insp.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-txt-muted font-mono mt-0.5 uppercase tracking-tighter">
                          ID: #{insp.id.toString().padStart(6, "0")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-corpoelec-blue tracking-wider">
                          {insp.inspectionNumber || "S/C"}
                        </span>
                        <span className="text-[10px] text-txt-muted uppercase font-bold">
                          Código Inspección
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-bg-main/20 flex items-center justify-center text-[10px] font-bold text-txt-sub border border-border-main">
                          {insp.inspector?.firstName?.[0] || "U"}
                          {insp.inspector?.lastName?.[0] || ""}
                        </div>
                        <span className="text-sm text-txt-sub font-semibold">
                          {insp.inspector?.firstName} {insp.inspector?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-txt-sub text-sm">
                        <MapPin size={14} className="text-txt-muted" />
                        {insp.facility?.name || "Sede no registrada"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            insp.statusId === 1
                              ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                              : insp.statusId === 2
                                ? "bg-amber-500/5 text-amber-500 border-amber-500/20"
                                : "bg-txt-muted/5 text-txt-muted border-border-main"
                          }`}
                        >
                          {insp.status?.name || "Pendiente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {user?.role !== "Analista" && (
                        <button
                          className="p-2 text-txt-muted hover:text-corpoelec-blue transition-all bg-transparent hover:bg-bg-main/10 rounded-lg group"
                          disabled={isFetchingEdit === insp.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(insp.id);
                          }}
                        >
                          {isFetchingEdit === insp.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Pencil
                              size={18}
                              className="transition-transform group-hover:scale-110"
                            />
                          )}
                        </button>
                      )}
                      <button
                        className="p-2 text-txt-muted hover:text-txt-main transition-all bg-transparent hover:bg-bg-main/10 rounded-lg group"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(insp.id);
                        }}
                      >
                        <Eye
                          size={18}
                          className="transition-transform group-hover:scale-110"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          initialData
            ? "Editar Inspección de Extintor"
            : "Registrar Inspección de Extintor"
        }
        maxWidth="max-w-4xl"
      >
        <ExtinguisherForm
          onCancel={handleCloseModal}
          onSuccess={fetchInspections}
          initialData={initialData}
          inspectionsList={inspections}
        />
      </Modal>

      {/* MODAL DETALLES */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInspectionId(null);
        }}
        title="Detalles de Inspección de Extintor"
        maxWidth="max-w-5xl"
      >
        {selectedInspectionId && (
          <ExtinguisherInspectionDetails inspectionId={selectedInspectionId} />
        )}
      </Modal>
    </div>
  );
}
