import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal";
import InstalacionesForm from "./InstalacionesForm";

export default function Instalaciones() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Inspección de Instalaciones</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Mantenimiento y estado general de las sedes y oficinas.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Registrar Inspección</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-10 text-slate-500">
          <p>No hay registro de inspecciones estructurales u oficinas actualmente.</p>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Inspección de Instalación"
        maxWidth="max-w-3xl"
      >
        <InstalacionesForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
