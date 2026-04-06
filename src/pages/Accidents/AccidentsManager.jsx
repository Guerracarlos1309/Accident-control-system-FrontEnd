import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal";
import AccidentForm from "./AccidentForm";

export default function AccidentsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Control de Accidentes</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gestión y registro de accidentes e incidentes laborales.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Registrar Accidente</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-10 text-slate-500">
          <p>No hay accidentes registrados actualmente.</p>
        </div>
      </div>

      {/* Modal de Registro */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Accidente"
        maxWidth="max-w-3xl"
      >
        <AccidentForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

