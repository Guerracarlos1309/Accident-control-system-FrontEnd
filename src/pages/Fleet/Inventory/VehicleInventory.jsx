import { useState, useEffect } from "react";
import { Plus, Search, Car, Settings, Palette, Calendar as CalendarIcon, Trash2, Loader2, RefreshCw } from "lucide-react";
import Modal from "../../../components/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import VehicleRegistryForm from "./VehicleRegistryForm";
import VehicleDetails from "./VehicleDetails";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function VehicleInventory() {
  const api = helpFetch();
  const { showNotification } = useNotification();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vehicles");
      if (res && !res.err) {
        setVehicles(res);
      } else {
        showNotification("Error al cargar vehículos", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    
    try {
      const res = await api.del(`/vehicles/${selectedVehicle.plate}`);
      if (res && !res.err) {
        showNotification("Vehículo eliminado correctamente", "success");
        fetchVehicles();
      } else {
        showNotification(res.statusText || "Error al eliminar", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Car className="text-blue-500" />
             Inventario de Flota Vehicular
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Registro centralizado de unidades de transporte y equipo pesado.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={fetchVehicles}
            className="p-2.5 rounded-xl bg-bg-surface border border-border-main text-txt-muted hover:text-txt-main hover:bg-bg-main/5 transition-all"
            title="Refrescar lista"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => {
              setSelectedVehicle(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex-1 md:flex-none"
          >
            <Plus size={18} />
            <span>Nuevo Vehículo</span>
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por placa, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 h-11"
        />
      </div>

      {loading && vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
          <p className="text-txt-muted font-medium">Sincronizando con el servidor...</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-main rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.1em] border-b border-border-main">
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Año</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {filteredVehicles.map(vehicle => (
                  <tr key={vehicle.plate} className="hover:bg-bg-main/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bg-main/5 border border-border-main flex items-center justify-center text-corpoelec-blue overflow-hidden shrink-0 relative">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <>
                              <img src={`http://localhost:3000${vehicle.images[0].imageUrl}`} alt="Vehículo" className="w-full h-full object-cover" />
                              {vehicle.images.length > 1 && (
                                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-bold px-1 rounded-tl-lg">
                                  +{vehicle.images.length - 1}
                                </div>
                              )}
                            </>
                          ) : (
                            <Car size={20} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-txt-main">{vehicle.plate}</div>
                          <div className="text-[10px] font-bold text-txt-muted uppercase tracking-widest mt-0.5">
                            {vehicle.model?.brand?.name} {vehicle.model?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-txt-main capitalize">{vehicle.type?.name || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-txt-main">{vehicle.color || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-txt-main">{vehicle.year}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsDetailsModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-lg transition-colors border border-corpoelec-blue/20"
                        >
                          Ver Detalles
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-txt-muted hover:text-corpoelec-blue hover:bg-bg-main/10 rounded-lg transition-all"
                          title="Editar vehículo"
                        >
                          <Settings size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-lg transition-all"
                          title="Eliminar vehículo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <p className="text-txt-muted text-sm">No se encontraron vehículos que coincidan con la búsqueda.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title={`Detalles de Vehículo ${selectedVehicle?.plate}`} 
        maxWidth="max-w-4xl"
      >
        <VehicleDetails data={selectedVehicle} />
      </Modal>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedVehicle ? `Editar Vehículo ${selectedVehicle.plate}` : "Registrar Vehículo en la Flota"} 
        maxWidth="max-w-2xl"
      >
        <VehicleRegistryForm 
          onCancel={() => setIsModalOpen(false)} 
          initialData={selectedVehicle}
          onSuccess={fetchVehicles}
        />
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que deseas eliminar permanentemente el vehículo con placa ${selectedVehicle?.plate}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Unidad"
        variant="danger"
      />
    </div>
  );
}

