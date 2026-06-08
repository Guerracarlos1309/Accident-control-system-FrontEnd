import { useState, useEffect } from "react";
import {
  Shield,
  Calendar,
  Layers,
  Heart
} from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";
import { validateGenericText } from "../../../helpers/validationHelper";
export default function EquipmentForm({ onCancel, onSubmit, initialData }) {
  const { showNotification } = useNotification();
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

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let result = { isValid: true, message: "" };
    if (name === "brand" || name === "model" || name === "code") {
      const label = name === "brand" ? "Marca" : name === "model" ? "Modelo" : "Código";
      result = validateGenericText(value, label, 2, false);
    }
    setErrors((prev) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message,
    }));
    return result.isValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (errors[name]) {
        validateField(name, value);
      }
      return updated;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const isBrandValid = validateField("brand", formData.brand);
    const isModelValid = validateField("model", formData.model);
    const isCodeValid = validateField("code", formData.code);

    if (!isBrandValid || !isModelValid || !isCodeValid) {
      showNotification("No se puede guardar. Hay campos con datos inválidos o sospechosos.", "error");
      return;
    }
    
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
                onBlur={handleBlur}
                className={`input-field h-12 border focus:border-corpoelec-blue uppercase ${errors.brand ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : "border-border-main"}`}
                placeholder="Ej: MSA / 3M"
              />
              {errors.brand && (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.brand}
                </p>
              )}
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
                onBlur={handleBlur}
                className={`input-field h-12 border focus:border-corpoelec-blue uppercase ${errors.model ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : "border-border-main"}`}
                placeholder="Ej: V-GARD / DIELECTR"
              />
              {errors.model && (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.model}
                </p>
              )}
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
                onBlur={handleBlur}
                className={`input-field h-12 border focus:border-corpoelec-blue font-mono uppercase ${errors.code ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : "border-border-main"}`}
                placeholder="Ej: SN-2026-XXXX"
              />
              {errors.code && (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.code}
                </p>
              )}
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
