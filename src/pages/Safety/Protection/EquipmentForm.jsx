import { useState } from "react";
import {
  Shield,
  Tag,
  Settings,
  Calendar,
  Layers,
  Building2,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function EquipmentForm({ onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    brand: "",
    model: "",
    type: "EPP", // EPP | EPC
    unit: "piezas",
    category: "",
    management: "",
    organizationalUnit: "",
    initialQuantity: "",
    minStock: "",
    status: "nuevo",
    entryDate: new Date().toISOString().split("T")[0],
    nextReviewDate: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving safety equipment...", formData);
  };

  const categories = {
    EPP: [
      "Craneal",
      "Visual",
      "Auditiva",
      "Facial",
      "Manual",
      "Corporal",
      "Respiratoria",
      "Altura",
      "Otro",
    ],
    EPC: [
      "Incendio",
      "Señalización",
      "Delimitación/Barreras",
      "Primeros Auxilios",
      "Seguridad Vial",
      "Otro",
    ],
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IDENTIFICACIÓN */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Shield size={16} className="text-blue-500" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Identificación del Equipo
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nombre del Equipo *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field h-10"
                placeholder="Ej: Casco Dieléctrico Clase E"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Código / Serial
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input-field h-10"
                placeholder="Ej: SN-2024-XXXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Marca
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Modelo
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
          </div>
        </div>

        {/* CLASIFICACIÓN Y UNIDADES */}
        <div className="col-span-2 space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Layers size={16} className="text-emerald-500" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Clasificación y Medidas
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tipo de Equipo
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
              >
                <option value="EPP">Protección Personal (EPP)</option>
                <option value="EPC">Protección Colectiva (EPC)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Categoría
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
              >
                <option value="">Seleccione...</option>
                {categories[formData.type].map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Unidad de Medida
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
              >
                <option value="pares">Pares</option>
                <option value="piezas">Piezas</option>
                <option value="equipos">Equipos</option>
                <option value="juego">Juego</option>
                <option value="kit">Kit</option>
                <option value="rollo">Rollo</option>
              </select>
            </div>
          </div>
        </div>

        {/* ESTRUCTURA ORGANIZATIVA */}
        <div className="col-span-2 space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 size={16} className="text-purple-500" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Ubicación y Responsabilidad
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gerencia
              </label>
              <input
                type="text"
                name="management"
                value={formData.management}
                onChange={handleChange}
                className="input-field h-10"
                placeholder="Ej: Gerencia de Distribución"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Unidad Organizativa
              </label>
              <input
                type="text"
                name="organizationalUnit"
                value={formData.organizationalUnit}
                onChange={handleChange}
                className="input-field h-10"
                placeholder="Ej: Departamento de Mantenimiento"
              />
            </div>
          </div>
        </div>

        {/* STOCK Y FECHAS */}
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Package size={16} className="text-amber-500" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Stock
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cant. Inicial
              </label>
              <input
                type="number"
                name="initialQuantity"
                required
                value={formData.initialQuantity}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Stock Min.
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Calendar size={16} className="text-red-500" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Fechas Control
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                F. Ingreso
              </label>
              <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Prox. Revisión
              </label>
              <input
                type="date"
                name="nextReviewDate"
                value={formData.nextReviewDate}
                onChange={handleChange}
                className="input-field h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER PEGAJOSO (SÓLIDO) */}
      <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary px-8 h-11">
          Registrar Equipo
        </button>
      </div>
    </form>
  );
}
