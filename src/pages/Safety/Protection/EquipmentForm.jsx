import { useState, useEffect } from "react";
import {
  Shield,
  Calendar,
  Layers,
  Heart
} from "lucide-react";

export default function EquipmentForm({ onCancel, onSubmit, initialData }) {
  // Extract details from initialData
  const officialName = initialData?.name || "EQUIPO DE PROTECCIÓN";
  const categoryId = initialData?.categoryId;
  const isEPP = categoryId <= 23; // 1-23 is EPP, 24-38 is EPC

  const [formData, setFormData] = useState({
    code: "",
    brand: "",
    model: "",
    classification: "OTROS", // CABEZA | PECHO | PIERNAS | PIES | OTROS
    entryDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (initialData) {
      let brand = "";
      let model = "";
      let code = "";
      let classification = isEPP ? "CABEZA" : "OTROS";
      
      const desc = initialData.description || "";
      if (desc.includes("MARCA:") || desc.includes("CLASIF:")) {
        const parts = desc.split(" | ");
        parts.forEach(part => {
          const [key, val] = part.split(": ");
          if (key === "MARCA") brand = val;
          else if (key === "MODELO") model = val;
          else if (key === "COD") code = val;
          else if (key === "CLASIF") classification = val;
        });
      }

      setFormData({
        code: code || "",
        brand: brand || "",
        model: model || "",
        classification: classification || (isEPP ? "CABEZA" : "OTROS"),
        entryDate: initialData.lastUpdate || new Date().toISOString().split("T")[0]
      });
    }
  }, [initialData, isEPP]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const cleanBrand = formData.brand.trim().toUpperCase();
    const cleanModel = formData.model.trim().toUpperCase();
    const cleanCode = formData.code.trim().toUpperCase();
    const cleanClasif = isEPP ? formData.classification.toUpperCase() : "OTROS";
    
    // Pack classification, brand, model, and serial details inside the description field
    const packedDescription = `CLASIF: ${cleanClasif} | MARCA: ${cleanBrand || "GENÉRICO"} | MODELO: ${cleanModel || "N/A"} | COD: ${cleanCode || "S/N"}`;

    const payload = {
      name: officialName.toUpperCase(),
      categoryId: parseInt(categoryId),
      totalQuantity: 0, 
      operativeQuantity: 0,
      lastUpdate: formData.entryDate,
      description: packedDescription
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 text-txt-main">
      <div className="space-y-6">
        
        {/* COMPONENTE DE INFORMACIÓN FIJA */}
        <div className="bg-corpoelec-blue/5 border border-corpoelec-blue/20 p-4 rounded-2xl flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-2 text-corpoelec-blue">
            <Layers size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Detalle del Renglón a Configurar</span>
          </div>
          <span className="text-xs font-black uppercase text-txt-main">
            {categoryId?.toString().padStart(2, "0")} - {officialName}
          </span>
          <span className="text-[9px] font-bold text-txt-muted uppercase tracking-wider">
            Tipo de Protección: {isEPP ? "Personal (EPP)" : "Colectiva (EPC)"}
          </span>
        </div>

        {/* CLASIFICACIÓN CORPORAL (SOLO EPP) */}
        {isEPP && (
          <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-main/40">
              <Heart size={14} className="text-corpoelec-blue" />
              <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
                Zona de Protección Corporal
              </h4>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Clasificación Corporal *
              </label>
              <select
                name="classification"
                required
                value={formData.classification}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-bold text-txt-main bg-bg-surface cursor-pointer"
              >
                <option value="CABEZA">PARA LA CABEZA</option>
                <option value="PECHO">PARA EL PECHO</option>
                <option value="PIERNAS">PARA LAS PIERNAS</option>
                <option value="PIES">PARA LOS PIES</option>
                <option value="OTROS">OTROS / GENERAL</option>
              </select>
            </div>
          </div>
        )}

        {/* DETALLES DEL FABRICANTE */}
        <div className="bg-bg-main/5 p-5 rounded-3xl border border-border-main/50 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-main/40">
            <Shield size={14} className="text-corpoelec-blue" />
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Especificaciones del Fabricante
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Marca del Fabricante
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue uppercase"
                placeholder="Ej: MSA / 3M"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Modelo / Especificación
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue uppercase"
                placeholder="Ej: V-GARD / DIELECTR"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Código / Serial de Seguridad
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue font-mono uppercase"
                placeholder="Ej: SN-2026-XXXX"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Fecha de Registro *
              </label>
              <input
                type="date"
                name="entryDate"
                required
                value={formData.entryDate}
                onChange={handleChange}
                className="input-field h-12 border border-border-main focus:border-corpoelec-blue text-center font-bold"
              />
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER PEGAJOSO */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main/80 flex justify-end gap-3 translate-y-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-border-main text-[11px] font-black uppercase text-txt-muted hover:text-txt-main hover:bg-bg-main/15 transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-8 py-2.5 rounded-xl bg-corpoelec-blue text-white text-[11px] font-black uppercase shadow-lg shadow-corpoelec-blue/15 hover:bg-corpoelec-blue/90 transition-all cursor-pointer"
        >
          Guardar Especificación
        </button>
      </div>
    </form>
  );
}
