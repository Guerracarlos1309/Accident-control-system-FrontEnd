import { useState, useEffect } from "react";
import { Plus, Loader2, Calendar, User, MapPin, ClipboardCheck, ArrowUpRight, Eye, Pencil } from "lucide-react";
import Modal from "../../../../components/Modal";
import VehicleForm from "./VehicleForm";
import VehicleInspectionDetails from "./VehicleInspectionDetails";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function VehicleManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [initialData, setInitialData] = useState(null); // Added for editing
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false); // For edit button loading state
  const api = helpFetch();
  const { showNotification } = useNotification();

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await api.get("/inspections");
      if (res && !res.err) {
        const vehicleInspections = res.filter(i => i.type === "Vehiculo" || i.vehicleInspection);
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
        showNotification("No se pudo cargar la información para editar", "error");
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Inspección de Vehículos</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Control y registro de auditorías preventivas del parque automotor.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto shadow-lg shadow-blue-600/20" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Nueva Inspección</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden border border-slate-800/50 rounded-3xl">
        {loading && inspections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">Buscando registros técnicos...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <ClipboardCheck size={32} className="text-slate-700" />
            </div>
            <p className="font-medium">No hay inspecciones de vehículos registradas actualmente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                  <th className="px-6 py-4">Fecha e Informe</th>
                  <th className="px-6 py-4">Unidad / Placa</th>
                  <th className="px-6 py-4">Inspector</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {inspections.map((insp) => (
                  <tr 
                    key={insp.id} 
                    className="hover:bg-slate-800/10 transition-colors group cursor-pointer"
                    onClick={() => handleViewDetails(insp.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          <Calendar size={14} className="text-blue-500" />
                          {new Date(insp.date).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-tighter">ID: #{insp.id.toString().padStart(6, '0')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-black text-blue-400 tracking-wider">
                          {insp.vehicleInspection?.plateId || "S/P"}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Registro Vehicular</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-700">
                           {insp.inspector?.firstName?.[0] || "U"}{insp.inspector?.lastName?.[0] || ""}
                        </div>
                        <span className="text-sm text-slate-300 font-medium">{insp.inspector?.firstName} {insp.inspector?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin size={14} className="text-slate-600" />
                        {insp.facility?.name || "No asignada"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          insp.statusId === 1 ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : 
                          insp.statusId === 2 ? "bg-amber-500/5 text-amber-500 border-amber-500/20" : 
                          "bg-slate-500/5 text-slate-500 border-slate-500/20"
                        }`}>
                          {insp.status?.name || "Pendiente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                          className="p-2 text-slate-400 hover:text-blue-400 transition-all bg-slate-800/0 hover:bg-slate-800 rounded-lg group"
                          disabled={isFetchingEdit === insp.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(insp.id);
                          }}
                        >
                          {isFetchingEdit === insp.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Pencil size={18} className="transition-transform group-hover:scale-110" />
                          )}
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-white transition-all bg-slate-800/0 hover:bg-slate-800 rounded-lg group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(insp.id);
                          }}
                        >
                           <Eye size={18} className="transition-transform group-hover:scale-110" />
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
        title={initialData ? "Editar Reporte de Inspección" : "Nueva Inspección Digital de Vehículo"}
        maxWidth="max-w-4xl"
      >
        <VehicleForm 
          onCancel={handleCloseModal} 
          onSuccess={fetchInspections}
          initialData={initialData}
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


