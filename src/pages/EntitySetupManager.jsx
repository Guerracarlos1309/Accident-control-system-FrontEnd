import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../components/Modal";

export default function EntitySetupManager({ title, description, entityName, FormComponent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">{description}</p>
        </div>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Nuevo {entityName}</span>
        </button>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="text-center py-10 text-slate-500">
          <p>La base de datos de {entityName.toLowerCase()}s se encuentra vacía.</p>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Registrar ${entityName}`}
        maxWidth="max-w-3xl"
      >
        {FormComponent && <FormComponent onCancel={() => setIsModalOpen(false)} />}
      </Modal>
    </div>
  );
}

