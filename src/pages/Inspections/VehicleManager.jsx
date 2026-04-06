import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal";
import VehicleForm from "./VehicleForm";

export default function VehicleManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Inspección de Vehículos</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Control y registro de inspecciones del parque automotor.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Registrar Inspección</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-10 text-slate-500">
          <p>No hay inspecciones de vehículos registradas actualmente.</p>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Inspección de Vehículo"
        maxWidth="max-w-4xl"
      >
        <VehicleForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
