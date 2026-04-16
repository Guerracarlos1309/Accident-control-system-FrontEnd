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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-slate-400 mt-1 text-sm">{description || `Gestión centralizada de ${entityName.toLowerCase()}s.`}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Nuevo {entityName}</span>
        </button>
      </div>

      {/* Controls Bar */}
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
        <div className="flex gap-2">
          <button className="btn-secondary h-11 px-3" onClick={() => setCurrentView(currentView === 'table' ? 'grid' : 'table')} title="Cambiar vista">
            {currentView === 'table' ? <LayoutGrid size={18} /> : <List size={18} />}
          </button>
          <button className="btn-secondary h-11">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Data View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Actualizando catálogo...</p>
        </div>
      ) : currentView === "table" ? (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/50 text-slate-200">
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
                    {fields.map(field => {
                      const value = field.displayKey ? item[field.displayKey] : item[field.name];
                      
                      // If we have an object, try to extract a label
                      // If not, or if the object is missing, fallback to the raw field value (e.g. the ID)
                      let displayValue = (typeof value === 'object' && value !== null) 
                        ? (value.name || value.label || value.title || JSON.stringify(value)) 
                        : (value || item[field.name]);
                      
                      return (
                        <td key={field.name} className="px-6 py-4 text-sm font-medium text-slate-300">
                          {displayValue || <span className="text-slate-600 italic">N/A</span>}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id || item.plate)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-6 py-20 text-center text-slate-500 font-medium">
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
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all group relative">
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(item)} className="p-2 bg-slate-800 rounded-lg text-blue-400 hover:bg-blue-500/10"><Edit2 size={14} /></button>
                <button 
                  onClick={() => handleDelete(item.id || item.plate)}
                  className="p-2 bg-slate-800 rounded-lg text-red-400 hover:bg-red-500/10"
                ><Trash2 size={14} /></button>
              </div>
              <div className="space-y-2">
                {fields.slice(0, 3).map(f => {
                  const val = item[f.name];
                  const disp = (typeof val === 'object' && val !== null) ? (val.name || val.label) : val;
                  return (
                    <div key={f.name}>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{f.label}</p>
                      <p className="text-slate-200 font-medium truncate">{disp || "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center glass-panel rounded-2xl text-slate-500 font-medium">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {fields.map(f => (
                <div key={f.name} className="space-y-1">
                  <label className="text-sm font-medium text-slate-400">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.type === "select" ? (
                    <select
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      required={f.required}
                      className="input-field h-11 text-slate-300 [&>option]:bg-slate-800"
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
        )}
      </Modal>
    </div>
  );
}
