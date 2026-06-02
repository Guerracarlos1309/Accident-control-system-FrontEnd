import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Calendar,
  User,
  MapPin,
  ClipboardCheck,
  ArrowUpRight,
  Eye,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import Modal from "../../../../components/Modal";
import VehicleForm from "./VehicleForm";
import VehicleInspectionDetails from "./VehicleInspectionDetails";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";
import { useAuth } from "../../../../context/AuthContext";

export default function VehicleManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [initialData, setInitialData] = useState(null); // Added for editing
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFetchingEdit, setIsFetchingEdit] = useState(false); // For edit button loading state
  const api = helpFetch();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/inspections");
      if (res && !res.err) {
        const vehicleInspections = res.filter(
          (i) => i.type === "Vehiculo" || i.vehicleInspection,
        );
        setInspections(vehicleInspections);
      } else {
        showNotification("Error al cargar historial de inspecciones", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
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
    setIsFetchingEdit(id); // Store ID to show loader on specific button
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

  // Lógica de filtrado combinada
  const filteredInspections = inspections.filter((insp) => {
    const matchesSearch =
      insp.id.toString().includes(searchTerm) ||
      (insp.vehicleInspection?.plateId &&
        insp.vehicleInspection.plateId
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      `${insp.inspector?.firstName} ${insp.inspector?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (insp.facility?.name &&
        insp.facility.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || String(insp.statusId) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-txt-main">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-txt-main">
            Inspección de Vehículos
          </h2>
          <p className="text-txt-muted mt-1 text-sm md:text-base">
            Control y registro de auditorías preventivas del parque automotor.
          </p>
        </div>
        {user?.role !== "Analista" && (
          <button
            className="btn-primary w-full sm:w-auto shadow-lg shadow-corpoelec-blue/20"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            <span>Nueva Inspección</span>
          </button>
        )}
      </div>

      {/* BARRA DE FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-[2rem] border border-border-main/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="md:col-span-2 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-corpoelec-blue transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, placa, inspector o sede..."
            className="input-field !pl-12 h-12 w-full text-xs font-bold uppercase tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-corpoelec-red uppercase hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-corpoelec-blue transition-colors">
            <Filter size={18} />
          </div>
          <select
            className="input-field !pl-12 h-12 w-full text-xs font-bold uppercase tracking-widest cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="1">Pendientes</option>
            <option value="2">En Proceso</option>
            <option value="3">Completados</option>
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-txt-muted">
            <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Buscando registros técnicos...
            </p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-20 text-txt-muted">
            <div className="w-16 h-16 bg-bg-main/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-main">
              <ClipboardCheck size={32} className="text-txt-muted" />
            </div>
            <p className="font-bold uppercase tracking-widest text-xs">
              {searchTerm || statusFilter !== "all"
                ? "No se encontraron inspecciones para los filtros aplicados."
                : "No hay inspecciones de vehículos registradas actualmente."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                  <th className="px-8 py-5">Fecha e Informe</th>
                  <th className="px-8 py-5">Unidad / Placa</th>
                  <th className="px-8 py-5">Inspector</th>
                  <th className="px-8 py-5">Ubicación</th>
                  <th className="px-8 py-5 text-center">Estado</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/20">
                {filteredInspections.map((insp) => (
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
                          {insp.vehicleInspection?.plateId || "S/P"}
                        </span>
                        <span className="text-[10px] text-txt-muted uppercase font-bold">
                          Registro Vehicular
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
                        {insp.facility?.name || "No asignada"}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            insp.statusId === 3
                              ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                              : insp.statusId === 1
                                ? "bg-amber-500/5 text-amber-500 border-amber-500/20"
                                : "bg-corpoelec-blue/5 text-corpoelec-blue border-corpoelec-blue/20"
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

      {/* MODAL NUEVA INSPECCIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          initialData
            ? "Editar Reporte de Inspección"
            : "Nueva Inspección Digital de Vehículo"
        }
        maxWidth="max-w-4xl"
      >
        <VehicleForm
          onCancel={handleCloseModal}
          onSuccess={fetchInspections}
          initialData={initialData}
          inspectionsList={inspections}
        />
      </Modal>

      {/* MODAL DETALLES DE INSPECCIÓN */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInspectionId(null);
        }}
        title="Detalles del Reporte de Inspección"
        maxWidth="max-w-5xl"
      >
        {selectedInspectionId && (
          <VehicleInspectionDetails inspectionId={selectedInspectionId} />
        )}
      </Modal>
    </div>
  );
}
