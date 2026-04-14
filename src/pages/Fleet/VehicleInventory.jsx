import { useState } from "react";
import { Plus, Search, Car, Settings, Palette, Calendar as CalendarIcon } from "lucide-react";
import Modal from "../../components/Modal";
import VehicleRegistryForm from "./VehicleRegistryForm";

const MOCK_VEHICLES = [
  { id: 1, plate: "A12BC3D", brand: "Toyota", model: "Hilux", type: "Pick-up", color: "Blanco", year: 2022 },
  { id: 2, plate: "G98HI7J", brand: "Ford", model: "F-150", type: "Pick-up", color: "Gris", year: 2021 },
  { id: 3, plate: "V55XY1Z", brand: "Chevrolet", model: "N300", type: "Van", color: "Blanco", year: 2023 },
];

export default function VehicleInventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = MOCK_VEHICLES.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo Vehículo</span>
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="glass-panel rounded-3xl p-6 hover:border-blue-500/50 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Car size={64} />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Car size={24} />
              </div>
              <div>
                <div className="text-xl font-black text-white">{vehicle.plate}</div>
                <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">{vehicle.brand} {vehicle.model}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Settings size={14} /> <span>Tipo</span>
                </div>
                <span className="text-slate-300 font-medium capitalize">{vehicle.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Palette size={14} /> <span>Color</span>
                </div>
                <span className="text-slate-300 font-medium">{vehicle.color}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarIcon size={14} /> <span>Año</span>
                </div>
                <span className="text-slate-300 font-medium">{vehicle.year}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <Settings size={16} />
              </button>
              <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Ver Historial</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Vehículo en la Flota" maxWidth="max-w-2xl">
        <VehicleRegistryForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
