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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-main tracking-tight">{title}</h2>
          <p className="text-txt-sub mt-1 text-sm">{description}</p>
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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder={`Buscar ${entityName.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 h-12 text-sm font-medium"
          />
        </div>
        <button className="btn-secondary h-12">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      {/* Table Area */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-border-main/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main/5 border-b border-border-main">
                {fields.map(f => (
                  <th key={f.name} className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">{f.label}</th>
                ))}
                <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/30">
              {filteredData.length > 0 ? filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-bg-primary/5 transition-colors group">
                  {fields.map(f => (
                    <td key={f.name} className="px-6 py-4 text-sm font-bold text-txt-sub">
                      {item[f.name] || <span className="text-txt-muted/50 italic font-normal">N/A</span>}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="p-2 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-24 text-center text-txt-muted">
                    <div className="flex flex-col items-center gap-3">
                      <Search size={40} className="text-txt-muted/20" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">No se encontraron registros de {entityName.toLowerCase()}s.</p>
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            {fields.map(f => (
              <div key={f.name} className="space-y-2">
                <label className="text-xs font-black text-txt-sub uppercase tracking-widest ml-1">
                  {f.label} {f.required && <span className="text-corpoelec-red">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea 
                    name={f.name}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                    required={f.required}
                    className="input-field min-h-[120px] py-4 text-sm font-medium"
                    placeholder={`Ingrese ${f.label.toLowerCase()}...`}
                  />
                ) : (
                  <input 
                    type={f.type || "text"}
                    name={f.name}
                    value={formData[f.name] || ""}
                    onChange={handleChange}
                    required={f.required}
                    className="input-field h-12 text-sm font-medium"
                    placeholder={`Ingrese ${f.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="pt-8 flex justify-end gap-3 border-t border-border-main mt-8">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary px-8"
            >
              {editingItem ? "Actualizar Registro" : "Guardar Registro"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
