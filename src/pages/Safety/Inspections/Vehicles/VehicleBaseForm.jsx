import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { helpFetch } from "../../../../helpers/helpFetch";
import { useNotification } from "../../../../context/NotificationContext";

export default function VehicleBaseForm({ onCancel, onSuccess }) {
  const api = helpFetch();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    plate: "",
    brandId: "",
    modelId: "",
    vehicleTypeId: "",
    color: "",
    year: "",
    facilityId: "",
  });

  const [lookups, setLookups] = useState({
    brands: [],
    models: [],
    types: [],
    facilities: [],
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, modelRes, typeRes, facRes] = await Promise.all([
          api.get("/vehicles/brands"),
          api.get("/vehicles/models"),
          api.get("/vehicles/types"),
          api.get("/facilities"),
        ]);
        setLookups({
          brands: brandRes || [],
          models: modelRes || [],
          types: typeRes || [],
          facilities: facRes || [],
        });
      } catch (error) {
        showNotification("Error al cargar datos del formulario", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plate.trim()) {
      showNotification("La placa es obligatoria", "error");
      return;
    }
    if (!formData.facilityId) {
      showNotification("Debe seleccionar la sede asignada al vehículo", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        plate: formData.plate.trim().toUpperCase(),
        modelId: formData.modelId ? parseInt(formData.modelId) : null,
        vehicleTypeId: formData.vehicleTypeId
          ? parseInt(formData.vehicleTypeId)
          : null,
        color: formData.color || null,
        year: formData.year ? parseInt(formData.year) : null,
        facilityId: parseInt(formData.facilityId),
      };
      const res = await api.post("/vehicles", { body: payload });
      if (res && !res.err) {
        showNotification("Vehículo registrado correctamente", "success");
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        showNotification(
          res.message || "Error al registrar el vehículo",
          "error"
        );
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredModels = formData.brandId
    ? lookups.models.filter(
        (m) => String(m.brandId) === String(formData.brandId)
      )
    : lookups.models;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-txt-main">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Placa */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Placa *
          </label>
          <input
            type="text"
            name="plate"
            required
            value={formData.plate}
            onChange={handleChange}
            className="input-field h-12 font-black uppercase tracking-widest"
            placeholder="ABC-12D"
          />
        </div>

        {/* Sede asignada */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1 flex items-center gap-1">
            <MapPin size={11} /> Sede Asignada *
          </label>
          <select
            name="facilityId"
            required
            value={formData.facilityId}
            onChange={handleChange}
            className="input-field h-12 font-semibold cursor-pointer"
          >
            <option value="">Seleccione sede...</option>
            {lookups.facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Color
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="input-field h-12"
            placeholder="Blanco"
          />
        </div>

        {/* Año */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Año de Fabricación
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="input-field h-12"
            placeholder="2015"
            min="1950"
            max={new Date().getFullYear() + 1}
          />
        </div>

        {/* Marca */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Marca
          </label>
          <select
            name="brandId"
            value={formData.brandId}
            onChange={(e) => {
              setFormData({ ...formData, brandId: e.target.value, modelId: "" });
            }}
            className="input-field h-12 cursor-pointer"
          >
            <option value="">Seleccione marca</option>
            {lookups.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Modelo */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Modelo
          </label>
          <select
            name="modelId"
            value={formData.modelId}
            onChange={handleChange}
            className="input-field h-12 cursor-pointer"
          >
            <option value="">Seleccione modelo</option>
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.brand ? `(${m.brand.name})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de vehículo */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">
            Tipo de Vehículo
          </label>
          <select
            name="vehicleTypeId"
            value={formData.vehicleTypeId}
            onChange={handleChange}
            className="input-field h-12 cursor-pointer"
          >
            <option value="">Seleccione tipo</option>
            {lookups.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-border-main flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-border-main text-[11px] font-black uppercase text-txt-muted hover:text-txt-main hover:bg-bg-main/15 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-8 py-2.5 rounded-xl bg-corpoelec-blue text-white text-[11px] font-black uppercase shadow-lg shadow-corpoelec-blue/15 hover:bg-corpoelec-blue/90 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Registrar Vehículo"}
        </button>
      </div>
    </form>
  );
}
