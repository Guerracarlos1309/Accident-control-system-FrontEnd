import { useState, useEffect, useMemo } from "react";
import { 
  Truck, 
  Hash, 
  Palette, 
  Calendar, 
  Car,
  Settings,
  Shield,
  Loader2,
  Camera,
  X,
  Image as ImageIcon
} from "lucide-react";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function VehicleRegistryForm({ onCancel, initialData = null, onSuccess }) {
  const api = helpFetch();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    plate: initialData?.plate || "",
    modelId: initialData?.modelId || "",
    vehicleTypeId: initialData?.vehicleTypeId || "",
    color: initialData?.color || "",
    year: initialData?.year || new Date().getFullYear(),
  });

  const [lookups, setLookups] = useState({
    brands: [],
    models: [],
    types: []
  });

  const [selectedBrand, setSelectedBrand] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image handling
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [brandsRes, modelsRes, typesRes] = await Promise.all([
          api.get("/lookups/brands"),
          api.get("/lookups/models"),
          api.get("/lookups/vehicle-types")
        ]);

        setLookups({
          brands: Array.isArray(brandsRes) ? brandsRes : [],
          models: Array.isArray(modelsRes) ? modelsRes : [],
          types: Array.isArray(typesRes) ? typesRes : []
        });

        if (brandsRes?.err || modelsRes?.err || typesRes?.err) {
          showNotification("Algunos catálogos no pudieron cargarse", "warning");
        }

        // Si estamos editando, inicializar la marca seleccionada
        if (initialData?.model?.brandId) {
          setSelectedBrand(initialData.model.brandId.toString());
        }
      } catch (error) {
        showNotification("Error al cargar catálogos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, [initialData]);

  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    return lookups.models.filter(m => {
      const bId = m.brandId || m.brand_id;
      return String(bId) === String(selectedBrand);
    });
  }, [selectedBrand, lookups.models]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    setFormData({ ...formData, modelId: "" });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setImageFiles(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };
  
  const removeExistingImage = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setDeletedImageIds(prev => [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = initialData ? "put" : "post";
      const endpoint = initialData ? `/vehicles/${initialData.plate}` : "/vehicles";
      
      const sendData = new FormData();
      Object.keys(formData).forEach(key => {
        sendData.append(key, formData[key]);
      });
      
      imageFiles.forEach(file => {
        sendData.append("images", file);
      });
      
      deletedImageIds.forEach(id => {
        sendData.append("deletedImageIds", id);
      });
      
      const res = await api[method](endpoint, { body: sendData });

      if (res && !res.err) {
        showNotification(
          initialData ? "Vehículo actualizado" : "Vehículo registrado", 
          "success"
        );
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(res.statusText || "Error en la operación", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-txt-muted">
        <Loader2 size={32} className="animate-spin text-corpoelec-blue" />
        <p className="text-sm font-medium">Cargando catálogos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificación Principal */}
        <div className="col-span-1 border-b border-border-main pb-4 md:col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Shield size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">Identificación Técnica</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Placa / Serial *</label>
                <input 
                  type="text" 
                  name="plate" 
                  required 
                  disabled={!!initialData}
                  value={formData.plate} 
                  onChange={handleChange} 
                  className="input-field h-11 uppercase font-bold text-corpoelec-blue disabled:opacity-50" 
                  placeholder="Ej: ABC-123" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Año de Fabricación</label>
                <input 
                  type="number" 
                  name="year" 
                  value={formData.year} 
                  onChange={handleChange} 
                  className="input-field h-11" 
                />
              </div>
           </div>
        </div>

        {/* Detalles del Vehículo */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
             <Car size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">Marca y Modelo</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Marca</label>
                <select 
                  required
                  value={selectedBrand} 
                  onChange={handleBrandChange} 
                  className="input-field h-11 text-txt-main [&>option]:bg-bg-surface"
                >
                  <option value="">Seleccione marca...</option>
                  {lookups.brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Modelo</label>
                <select 
                  required
                  name="modelId"
                  value={formData.modelId} 
                  onChange={handleChange} 
                  disabled={!selectedBrand}
                  className="input-field h-11 text-txt-main [&>option]:bg-bg-surface disabled:opacity-30"
                >
                  <option value="">{selectedBrand ? "Seleccione modelo..." : "Primero elija marca"}</option>
                  {filteredModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
           </div>
        </div>

        {/* Clasificación */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-4">
             <Settings size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">Categorización</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Tipo de Vehículo</label>
                <select 
                  required
                  name="vehicleTypeId" 
                  value={formData.vehicleTypeId} 
                  onChange={handleChange} 
                  className="input-field h-11 text-txt-main [&>option]:bg-bg-surface"
                >
                  <option value="">Seleccione tipo...</option>
                  {lookups.types.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-muted uppercase tracking-wider">Color Predominante</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-field h-11" placeholder="Ej: Blanco" />
              </div>
           </div>
        </div>

        {/* Galería de Imágenes */}
        <div className="col-span-1 md:col-span-2 border-t border-border-main pt-6 mt-2">
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <ImageIcon size={16} className="text-corpoelec-blue" />
               <h4 className="text-[11px] font-bold text-txt-muted uppercase tracking-widest">Galería Fotográfica</h4>
             </div>
             <label className="cursor-pointer bg-bg-main/5 hover:bg-bg-main/10 text-txt-main px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 border border-border-main">
               <Camera size={14} /> Añadir Fotos
               <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
             </label>
           </div>
           
           {(existingImages.length > 0 || imagePreviews.length > 0) ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {/* Imágenes Existentes */}
               {existingImages.map((img) => (
                 <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-border-main">
                   <img src={`http://localhost:3000${img.imageUrl}`} alt="Vehículo" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button type="button" onClick={() => removeExistingImage(img.id)} className="bg-corpoelec-red/20 text-corpoelec-red hover:bg-corpoelec-red hover:text-white p-2 rounded-full transition-colors">
                       <X size={16} />
                     </button>
                   </div>
                 </div>
               ))}
               
               {/* Nuevas Imágenes a Subir */}
               {imagePreviews.map((preview, idx) => (
                 <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-dashed border-corpoelec-blue/50">
                   <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                   <div className="absolute top-1 right-1 bg-corpoelec-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Nueva</div>
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button type="button" onClick={() => removeNewImage(idx)} className="bg-corpoelec-red/20 text-corpoelec-red hover:bg-corpoelec-red hover:text-white p-2 rounded-full transition-colors">
                       <X size={16} />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="border-2 border-dashed border-border-main rounded-xl p-8 flex flex-col items-center justify-center text-txt-muted">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <p className="text-xs">No hay imágenes registradas.</p>
             </div>
           )}
        </div>

      </div>

      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary px-8 h-11 disabled:opacity-50"
        >
          {isSubmitting ? "Procesando..." : (initialData ? "Guardar Cambios" : "Registrar en Flota")}
        </button>
      </div>
    </form>
  );
}

