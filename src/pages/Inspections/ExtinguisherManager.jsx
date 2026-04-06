import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal";
import ExtinguisherForm from "./ExtinguisherForm";

export default function ExtinguisherManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Inspección de Equipo (Extintores)</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Mantenimiento y estado de la red de extintores.</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Registrar Equipo</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-10 text-slate-500">
          <p>No hay registro de equipos actualmente.</p>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Inspección de Extintor"
        maxWidth="max-w-3xl"
      >
        <ExtinguisherForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
