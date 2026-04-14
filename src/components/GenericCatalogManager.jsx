import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";
import Modal from "./Modal";

/**
 * GenericCatalogManager - A reusable component for simple CRUD tables.
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {string} entityName - Name of the entity (e.g., "Cargo")
 * @param {Array} fields - Array of field objects { name, label, type, required }
 * @param {Array} data - Initial data (for demo/preview)
 */
export default function GenericCatalogManager({ 
  title, 
  description, 
  entityName, 
  fields = [{ name: "name", label: "Nombre", type: "text", required: true }, { name: "description", label: "Descripción", type: "text" }],
  data = []
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Saving ${entityName}...`, formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-slate-400 mt-1 text-sm">{description}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo {entityName}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={`Buscar ${entityName.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-11"
          />
        </div>
        <button className="btn-secondary h-11">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                {fields.map(f => (
                  <th key={f.name} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{f.label}</th>
                ))}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredData.length > 0 ? filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                  {fields.map(f => (
                    <td key={f.name} className="px-6 py-4 text-sm text-slate-300">
                      {item[f.name] || <span className="text-slate-600 italic">N/A</span>}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-slate-700" />
                      <p>No se encontraron registros de {entityName.toLowerCase()}s.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Editar ${entityName}` : `Registrar ${entityName}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {fields.map(f => (
              <div key={f.name} className="space-y-1">
                <label className="text-sm font-medium text-slate-400">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea 
                    name={f.name}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                    required={f.required}
                    className="input-field min-h-[100px] py-3"
                    placeholder={`Ingrese ${f.label.toLowerCase()}...`}
                  />
                ) : (
                  <input 
                    type={f.type || "text"}
                    name={f.name}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                    required={f.required}
                    className="input-field h-11"
                    placeholder={`Ingrese ${f.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-slate-800 mt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary px-6"
            >
              {editingItem ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
