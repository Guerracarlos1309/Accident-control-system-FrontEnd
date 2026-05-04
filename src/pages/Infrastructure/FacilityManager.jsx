import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Zap, 
  Globe, 
  Layers,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  Eye
} from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import FacilityForm from "./FacilityForm";
import FacilityView from "./FacilityView";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";

export default function FacilityManager() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFacility, setEditingFacility] = useState(null);
  const [viewingFacility, setViewingFacility] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

  const api = helpFetch();
  const { showNotification } = useNotification();

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/facilities");
      if (Array.isArray(res)) {
        setFacilities(res);
      }
    } catch (error) {
      console.error("Error fetching facilities", error);
      showNotification("Error al cargar instalaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleView = (facility) => {
    setViewingFacility(facility);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await api.del(`facilities/${itemToDelete.id}`);
      if (res && !res.err) {
        showNotification("Instalación eliminada", "success");
        fetchFacilities();
        setItemToDelete(null);
      } else {
        showNotification("Error al eliminar", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFacility(null);
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.location?.parish?.city?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.installationType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tighter flex items-center gap-3">
             <Building2 className="text-corpoelec-blue" />
             Infraestructura y Sedes
          </h2>
          <p className="text-txt-muted mt-1 text-xs font-bold uppercase tracking-widest">Catálogo técnico de plantas, subestaciones y oficinas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Toggle Switch */}
          <div className="bg-bg-surface border border-border-main p-1 rounded-xl flex gap-1 shadow-sm">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-corpoelec-blue text-white shadow-md" : "text-txt-muted hover:bg-bg-main"}`}
              title="Vista de Cuadrícula"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-corpoelec-blue text-white shadow-md" : "text-txt-muted hover:bg-bg-main"}`}
              title="Vista de Tabla"
            >
              <List size={18} />
            </button>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shadow-lg shadow-corpoelec-blue/20 flex-1 md:flex-none"
          >
            <Plus size={18} />
            <span className="uppercase text-[10px] tracking-widest">Nueva Sede</span>
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="relative max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="BUSCAR POR NOMBRE, TIPO O UBICACIÓN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12 h-12 text-xs font-bold uppercase tracking-widest"
        />
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <Loader2 size={48} className="text-corpoelec-blue animate-spin" />
             <p className="text-txt-muted font-black uppercase tracking-[0.2em] text-[10px]">Sincronizando con el servidor...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[2.5rem] border-dashed border-border-main/50">
             <div className="w-20 h-20 rounded-full bg-bg-main flex items-center justify-center mx-auto mb-6">
                <Building2 size={40} className="text-txt-muted/30" />
             </div>
             <p className="text-txt-muted font-bold uppercase tracking-widest text-xs">No se encontraron instalaciones registradas.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFacilities.map(facility => (
              <div key={facility.id} className="glass-panel rounded-[2rem] p-6 group relative overflow-hidden transition-all hover:border-corpoelec-blue/30 shadow-sm hover:shadow-xl">
                {/* Background Image/Icon Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-corpoelec-blue/5 rounded-full blur-3xl group-hover:bg-corpoelec-blue/10 transition-all" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-bg-main border border-border-main flex items-center justify-center text-corpoelec-blue shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                      {facility.images && facility.images.length > 0 ? (
                        <img 
                          src={`http://localhost:3000${facility.images[0].imageUrl}`} 
                          alt={facility.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 size={32} />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/20 uppercase tracking-widest leading-none">
                        {facility.installationType?.name || "N/A"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">Activa</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-txt-main leading-tight mb-5 group-hover:text-corpoelec-blue transition-colors">
                    {facility.name}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={14} className="text-txt-muted mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest italic leading-none mb-1">Jurisdicción</span>
                        <span className="text-xs text-txt-main font-bold"> 
                          {facility.location?.parish?.city?.name || "N/A"}, {facility.location?.parish?.name || "N/A"}
                        </span>
                        <span className="text-[10px] text-txt-muted font-medium mt-0.5">Estado {facility.location?.parish?.city?.state?.name || "N/A"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-main/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-txt-muted">
                           <Zap size={12} className="text-amber-500" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Tensión</span>
                        </div>
                        <span className="text-sm font-black text-txt-main">{facility.voltageLevel || "N/A"}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-txt-muted">
                           <Globe size={12} className="text-corpoelec-blue" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Gps</span>
                        </div>
                        <span className="text-[10px] font-mono text-txt-muted truncate">{facility.coordinates || "No reg."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex gap-2">
                    <button 
                      onClick={() => handleView(facility)}
                      className="w-11 h-11 rounded-xl bg-bg-main border border-border-main text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/5 hover:border-corpoelec-blue/20 transition-all flex items-center justify-center active:scale-95"
                      title="Ver Ficha Técnica"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(facility)}
                      className="flex-1 h-11 rounded-xl bg-bg-main border border-border-main text-[9px] font-black uppercase tracking-widest text-txt-muted hover:text-corpoelec-blue hover:border-corpoelec-blue/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => setItemToDelete(facility)}
                      className="w-11 h-11 rounded-xl bg-bg-main border border-border-main text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/5 hover:border-corpoelec-red/20 transition-all flex items-center justify-center active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="glass-panel rounded-[2rem] overflow-hidden border border-border-main/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/50 border-b border-border-main">
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Instalación</th>
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Tipo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Ubicación</th>
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Nivel Tensión</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30">
                  {filteredFacilities.map(facility => (
                    <tr key={facility.id} className="hover:bg-bg-main/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-bg-main border border-border-main flex items-center justify-center text-corpoelec-blue shrink-0 overflow-hidden">
                            {facility.images && facility.images.length > 0 ? (
                              <img 
                                src={`http://localhost:3000${facility.images[0].imageUrl}`} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-txt-main leading-none mb-1 group-hover:text-corpoelec-blue transition-colors">{facility.name}</p>
                            <p className="text-[10px] text-txt-muted font-mono">{facility.coordinates || "Sin coordenadas"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-bg-main border border-border-main text-txt-muted uppercase tracking-widest leading-none">
                          {facility.installationType?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-txt-main">
                            {facility.location?.parish?.city?.name}, {facility.location?.parish?.name}
                          </p>
                          <p className="text-[10px] text-txt-muted">Edo. {facility.location?.parish?.city?.state?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Zap size={14} className="text-amber-500" />
                           <span className="text-xs font-black text-txt-main">{facility.voltageLevel || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleView(facility)}
                            className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all"
                            title="Ver Ficha"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(facility)}
                            className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(facility)}
                            className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!viewingFacility}
        onClose={() => setViewingFacility(null)}
        title="Ficha Técnica de Instalación"
        maxWidth="max-w-6xl"
      >
        <FacilityView facility={viewingFacility} />
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingFacility ? "Editar Instalación" : "Registro de Instalación"}
        maxWidth="max-w-4xl"
      >
        <FacilityForm 
          data={editingFacility}
          onCancel={handleModalClose} 
          onSubmitSuccess={() => {
            handleModalClose();
            fetchFacilities();
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Está seguro de que desea eliminar la instalación "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Instalación"
        variant="danger"
      />
    </div>
  );
}

