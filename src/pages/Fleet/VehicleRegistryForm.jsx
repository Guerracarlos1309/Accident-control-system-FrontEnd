import { useState, useEffect, useMemo } from "react";
import { 
  Truck, 
  Hash, 
  Palette, 
  Calendar, 
  Car,
  Settings,
  Shield,
  Loader2
} from "lucide-react";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = initialData ? "put" : "post";
      const endpoint = initialData ? `/vehicles/${initialData.plate}` : "/vehicles";
      
      const res = await api[method](endpoint, { body: formData });

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
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-slate-500">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm font-medium">Cargando catálogos...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificación Principal */}
        <div className="col-span-1 border-b border-slate-800 pb-4 md:col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Shield size={16} className="text-blue-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Identificación Técnica</h4>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Placa / Serial *</label>
                <input 
                  type="text" 
                  name="plate" 
                  required 
                  disabled={!!initialData}
                  value={formData.plate} 
                  onChange={handleChange} 
                  className="input-field h-11 uppercase font-bold text-blue-400 disabled:opacity-50" 
                  placeholder="Ej: ABC-123" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Año de Fabricación</label>
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
             <Car size={16} className="text-emerald-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Marca y Modelo</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marca</label>
                <select 
                  required
                  value={selectedBrand} 
                  onChange={handleBrandChange} 
                  className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
                >
                  <option value="">Seleccione marca...</option>
                  {lookups.brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modelo</label>
                <select 
                  required
                  name="modelId"
                  value={formData.modelId} 
                  onChange={handleChange} 
                  disabled={!selectedBrand}
                  className="input-field h-10 text-slate-300 [&>option]:bg-slate-800 disabled:opacity-30"
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
             <Settings size={16} className="text-amber-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Categorización</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Vehículo</label>
                <select 
                  required
                  name="vehicleTypeId" 
                  value={formData.vehicleTypeId} 
                  onChange={handleChange} 
                  className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
                >
                  <option value="">Seleccione tipo...</option>
                  {lookups.types.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Color Predominante</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className="input-field h-10" placeholder="Ej: Blanco" />
              </div>
           </div>
        </div>

      </div>

      <div className="sticky bottom-0 bg-slate-900 pt-8 pb-4 border-t border-slate-800 flex justify-end gap-4 mt-8">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
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

