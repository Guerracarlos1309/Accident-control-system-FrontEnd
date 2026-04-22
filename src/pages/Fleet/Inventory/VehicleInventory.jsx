import { useState, useEffect } from "react";
import { Plus, Search, Car, Settings, Palette, Calendar as CalendarIcon, Trash2, Loader2, RefreshCw } from "lucide-react";
import Modal from "../../../components/Modal";
import ConfirmModal from "../../../components/ConfirmModal";
import VehicleRegistryForm from "./VehicleRegistryForm";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function VehicleInventory() {
  const api = helpFetch();
  const { showNotification } = useNotification();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Sincronizando con el servidor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.plate} className="glass-panel rounded-3xl p-6 hover:border-blue-500/50 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Car size={64} />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Car size={24} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{vehicle.plate}</div>
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest leading-none mt-0.5">
                    {vehicle.model?.brand?.name} {vehicle.model?.name}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Settings size={14} /> <span>Tipo</span>
                  </div>
                  <span className="text-slate-300 font-medium capitalize">{vehicle.type?.name || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Palette size={14} /> <span>Color</span>
                  </div>
                  <span className="text-slate-300 font-medium">{vehicle.color || "No especificado"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarIcon size={14} /> <span>Año</span>
                  </div>
                  <span className="text-slate-300 font-medium">{vehicle.year}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsConfirmOpen(true);
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Eliminar vehículo"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  title="Editar detalles"
                >
                  <Settings size={16} />
                </button>
                <div className="flex-1" />
                <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest border border-blue-500/20 px-3 py-1.5 rounded-lg bg-blue-500/5">
                  Inspeccionar
                </button>
              </div>
            </div>
          ))}

          {filteredVehicles.length === 0 && (
            <div className="col-span-full py-16 text-center glass-panel rounded-3xl border-dashed">
              <p className="text-slate-500">No se encontraron vehículos que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      )}

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

