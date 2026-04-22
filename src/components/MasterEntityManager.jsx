import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import Modal from "./Modal";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

/**
 * MasterEntityManager - Unified component for managing any entity (Employees, Catalogs, Vehicles, etc.)
 * Supports both custom forms and auto-generated simple forms.
 */
export default function MasterEntityManager({ 
  title, 
  description, 
  entityName, 
  apiPath, 
  fields = [{ name: "name", label: "Nombre", type: "text", required: true }, { name: "description", label: "Descripción", type: "text" }],
  data: initialData = [],
  FormComponent = null,
  viewType = "table",
  modalMaxWidth = "max-w-2xl",
  onSuccess
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!!apiPath);
  const [currentView, setCurrentView] = useState(viewType);
  const api = helpFetch();
  const { showNotification } = useNotification();

  const fetchData = async () => {
    if (!apiPath) return;
    setLoading(true);
    try {
      const res = await api.get(apiPath);
      if (res && !res.err && Array.isArray(res)) {
        setData(res);
      } else {
        showNotification(`No se pudo obtener la lista de ${entityName.toLowerCase()}s`, "error");
        setData([]);
      }
    } catch (error) {
      showNotification(`Error al cargar ${entityName.toLowerCase()}s`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiPath]);

  const filteredData = data.filter(item => 
    Object.values(item).some(val => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') {
        return (val.name || val.label || val.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!apiPath) return;

    try {
      const method = editingItem ? "put" : "post";
      const id = editingItem?.id || editingItem?.plate; // Support both id and plate
      const url = editingItem ? `${apiPath}/${id}` : apiPath;
      
      const res = await api[method](url, { body: formData });
      if (res && !res.err) {
        showNotification(`${entityName} ${editingItem ? "actualizado" : "creado"}`, "success");
        fetchData();
        if (onSuccess) onSuccess(); // Notify parent
        setIsModalOpen(false);
      } else {
        showNotification(res.statusText || "Error en la operación", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Está seguro de eliminar este registro?`)) return;
    try {
      const res = await api.del(`${apiPath}/${id}`);
      if (res && !res.err) {
        showNotification(`${entityName} eliminado`, "success");
        fetchData();
        if (onSuccess) onSuccess(); // Notify parent
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-main tracking-tight">{title}</h2>
          <p className="text-txt-sub mt-1 text-sm">{description || `Gestión centralizada de ${entityName.toLowerCase()}s.`}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Nuevo {entityName}</span>
        </button>
      </div>

      {/* Controls Bar */}
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
            className="input-field pl-12 h-12"
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary h-12 px-4" onClick={() => setCurrentView(currentView === 'table' ? 'grid' : 'table')} title="Cambiar vista">
            {currentView === 'table' ? <LayoutGrid size={18} /> : <List size={18} />}
          </button>
          <button className="btn-secondary h-12">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Data View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
          <p className="text-txt-muted font-black tracking-widest uppercase text-[10px]">Actualizando datos...</p>
        </div>
      ) : currentView === "table" ? (
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
                  <tr key={idx} className="hover:bg-bg-main/5 transition-colors group">
                    {fields.map(field => {
                      const value = field.displayKey ? item[field.displayKey] : item[field.name];
                      
                      let displayValue = (typeof value === 'object' && value !== null) 
                        ? (value.name || value.label || value.title || JSON.stringify(value)) 
                        : (value || item[field.name]);
                      
                      return (
                        <td key={field.name} className="px-6 py-4 text-sm font-semibold text-txt-sub">
                          {displayValue || <span className="text-txt-muted/50 italic font-normal">N/A</span>}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id || item.plate)}
                          className="p-2 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-6 py-24 text-center text-txt-muted font-bold uppercase tracking-tight text-xs">
                      No se encontraron registros activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.length > 0 ? filteredData.map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-border-main/50 transition-colors group relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2 bg-bg-surface rounded-xl text-corpoelec-blue border border-border-main/50 hover:bg-corpoelec-blue/10"><Edit2 size={14} /></button>
                <button 
                  onClick={() => handleDelete(item.id || item.plate)}
                  className="p-2 bg-bg-surface rounded-xl text-corpoelec-red border border-border-main/50 hover:bg-corpoelec-red/10"
                ><Trash2 size={14} /></button>
              </div>
              <div className="space-y-4">
                {fields.slice(0, 3).map(f => {
                  const val = item[f.name];
                  const disp = (typeof val === 'object' && val !== null) ? (val.name || val.label) : val;
                  return (
                    <div key={f.name}>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-txt-muted font-black mb-1">{f.label}</p>
                      <p className="text-txt-main font-bold truncate leading-tight">{disp || "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center glass-panel rounded-3xl text-txt-muted font-bold uppercase tracking-tight text-xs">
              No hay registros para mostrar en esta vista.
            </div>
          )}
        </div>
      )}

      {/* Unified Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Editar ${entityName}` : `Nuevo ${entityName}`}
        maxWidth={modalMaxWidth}
      >
        {FormComponent ? (
          <FormComponent 
            data={editingItem} 
            onCancel={() => setIsModalOpen(false)} 
            onSubmit={handleSubmit}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {fields.map(f => (
                <div key={f.name} className="space-y-2">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    {f.label} {f.required && <span className="text-corpoelec-red">*</span>}
                  </label>
                  {f.type === "select" ? (
                    <select
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                      className="input-field h-12 text-sm font-bold"
                    >
                      <option value="">Seleccione...</option>
                      {f.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea 
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                      className="input-field min-h-[140px] py-4 text-sm font-bold"
                      placeholder={`Ingrese ${f.label.toLowerCase()}...`}
                    />
                  ) : (
                    <input 
                      type={f.type || "text"}
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                      className="input-field h-12 text-sm font-bold"
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
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
              >
                {editingItem ? "Actualizar Registro" : "Guardar Registro"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
