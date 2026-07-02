import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Zap,
  Globe,
  Settings,
  Shield,
  Loader2,
  Camera,
  X,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import GeographicCascade from "../../components/GeographicCascade";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";
import {
  validateFacilityName,
  validateCoordinates,
} from "../../helpers/validationHelper";

export default function FacilityForm({
  data: editingData,
  facilities = [],
  onCancel,
  onSubmitSuccess,
}) {
  const [formData, setFormData] = useState({
    name: editingData?.name || "",
    coordinates: editingData?.coordinates || "",
    installationTypeId: editingData?.installationTypeId || "",
    voltageLevel: editingData?.voltageLevel || "",
    referencePoint: editingData?.referencePoint || "",
  });

  const [errors, setErrors] = useState({});

  const isSubstationSelected = (typeId = formData.installationTypeId) => {
    const selectedType = installationTypes.find(
      (t) => String(t.id) === String(typeId),
    );
    if (!selectedType) return false;
    return selectedType.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes("subestacion");
  };

  const validateField = (name, value) => {
    let result = { isValid: true, message: "" };
    if (name === "name") {
      result = validateFacilityName(value, true);
    } else if (name === "coordinates") {
      result = validateCoordinates(value, false);
      if (result.isValid && value && Array.isArray(facilities)) {
        const currentCoord = value.trim().replace(/\s+/g, "");
        const isDuplicate = facilities.some((fac) => {
          if (editingData && fac.id === editingData.id) return false;
          if (!fac.coordinates) return false;
          return fac.coordinates.trim().replace(/\s+/g, "") === currentCoord;
        });
        if (isDuplicate) {
          result = {
            isValid: false,
            message:
              "Ya existe otra sede registrada con estas mismas coordenadas GPS.",
          };
        }
      }
    } else if (name === "installationTypeId") {
      if (!value) {
        result = {
          isValid: false,
          message: "El tipo de instalación es obligatorio.",
        };
      }
    } else if (name === "voltageLevel") {
      if (isSubstationSelected() && !value) {
        result = {
          isValid: false,
          message: "El nivel de tensión es obligatorio.",
        };
      }
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

  const [location, setLocation] = useState({
    stateId: editingData?.location?.parish?.city?.stateId || "",
    cityId: editingData?.location?.parish?.cityId || "",
    parish: editingData?.location?.parishId || "",
  });

  const defaultVoltages = ["230 kV", "115 kV", "34.5 kV", "N/A"];

  const voltageOptions = [...defaultVoltages];
  if (
    formData.voltageLevel &&
    !defaultVoltages.includes(formData.voltageLevel)
  ) {
    voltageOptions.unshift(formData.voltageLevel);
  }

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [installationTypes, setInstallationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const api = helpFetch();
  const { showNotification } = useNotification();
  const isEditing = !!editingData;

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get("/lookups/installation-types");
        if (Array.isArray(res)) setInstallationTypes(res);
      } catch (error) {
        console.error("Error loading installation types", error);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "installationTypeId") {
        if (!isSubstationSelected(value)) {
          updated.voltageLevel = "";
          setErrors((prevErr) => ({ ...prevErr, voltageLevel: "" }));
        }
      }
      if (errors[name]) {
        validateField(name, value);
      }
      return updated;
    });
  };

  const handleLocationChange = (geoData) => {
    setLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    if (geoData.parish) {
      setErrors((prev) => ({
        ...prev,
        location: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size and type (optional but recommended)
    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith("image/");
      if (!isValid)
        showNotification(
          `El archivo ${file.name} no es una imagen válida`,
          "error",
        );
      return isValid;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform direct validation checks to avoid async state delay
    const nameResult = validateFacilityName(formData.name, true);
    let coordResult = validateCoordinates(formData.coordinates, false);

    // Check coordinates uniqueness
    if (
      coordResult.isValid &&
      formData.coordinates &&
      Array.isArray(facilities)
    ) {
      const currentCoord = formData.coordinates.trim().replace(/\s+/g, "");
      const isDuplicate = facilities.some((fac) => {
        if (editingData && fac.id === editingData.id) return false;
        if (!fac.coordinates) return false;
        return fac.coordinates.trim().replace(/\s+/g, "") === currentCoord;
      });
      if (isDuplicate) {
        coordResult = {
          isValid: false,
          message:
            "Ya existe otra sede registrada con estas mismas coordenadas GPS.",
        };
      }
    }

    const isTypeValid = !!formData.installationTypeId;
    const isVoltageValid = !isSubstationSelected() || !!formData.voltageLevel;
    const isLocationValid = !!location.parish;

    // Build the new errors state
    const newErrors = {
      name: nameResult.isValid ? "" : nameResult.message,
      coordinates: coordResult.isValid ? "" : coordResult.message,
      installationTypeId: isTypeValid
        ? ""
        : "El tipo de instalación es obligatorio.",
      voltageLevel: isVoltageValid ? "" : "El nivel de tensión es obligatorio.",
      location: isLocationValid ? "" : "La ubicación geográfica es obligatoria",
    };

    setErrors(newErrors);

    if (
      !nameResult.isValid ||
      !coordResult.isValid ||
      !isTypeValid ||
      (isSubstationSelected() && !isVoltageValid) ||
      !isLocationValid
    ) {
      showNotification(
        "No se puede guardar la instalación. Hay campos obligatorios vacíos, duplicados o con formato incorrecto.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      // Append basic fields
      data.append("name", formData.name);
      data.append("coordinates", formData.coordinates);
      data.append("installationTypeId", formData.installationTypeId);
      data.append(
        "voltageLevel",
        isSubstationSelected() ? formData.voltageLevel : "",
      );
      data.append("parishId", location.parish);
      data.append("referencePoint", formData.referencePoint || "");

      // Append images
      selectedFiles.forEach((file) => {
        data.append("images", file);
      });

      const method = isEditing ? "put" : "post";
      const url = isEditing ? `facilities/${editingData.id}` : "facilities";

      const res = await api[method](url, { body: data });

      if (res && !res.err) {
        showNotification(
          `Instalación ${isEditing ? "actualizada" : "registrada"} con éxito`,
          "success",
        );
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        showNotification(
          res.statusText || res.message || "Error al procesar solicitud",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL */}
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-border-main/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue">
              <Building2 size={18} />
            </div>
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Identificación de la Sede
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest ml-1">
              Nombre de la Sede / Planta *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field h-12 font-bold ${errors.name ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
              placeholder="EJ: PLANTA TERMOELÉCTRICA JOSEFA CAMEJO"
              maxLength={50}
              onKeyDown={(e) => {
                if (
                  !/[-0-9 a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\./()]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "Delete" &&
                  e.key !== "Tab"
                ) {
                  e.preventDefault();
                }
              }}
            />
            {errors.name ? (
              <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                {errors.name}
              </p>
            ) : (
              <div>
                <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 self-end uppercase">
                  Debe contener letras, números y caracteres válidos
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest ml-1">
              Tipo de Instalación *
            </label>
            <select
              name="installationTypeId"
              required
              value={formData.installationTypeId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field h-12 font-bold appearance-none cursor-pointer ${errors.installationTypeId ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
            >
              <option value="">
                {loadingTypes ? "Cargando..." : "Seleccione el tipo..."}
              </option>
              {installationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name.toUpperCase()}
                </option>
              ))}
            </select>
            {errors.installationTypeId && (
              <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                {errors.installationTypeId}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: UBICACIÓN GEOGRÁFICA */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border-main/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <MapPin size={18} />
          </div>
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Ubicación y Territorio
          </h4>
        </div>
        <div
          className={`bg-bg-main/30 p-6 rounded-3xl border shadow-inner ${errors.location ? "border-corpoelec-red" : "border-border-main/40"}`}
        >
          <GeographicCascade
            value={location}
            onChange={handleLocationChange}
            required={true}
          />
        </div>
        {errors.location && (
          <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
            {errors.location}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest ml-1">
            Punto de Referencia (Opcional)
          </label>
          <textarea
            name="referencePoint"
            value={formData.referencePoint || ""}
            onChange={handleChange}
            className="input-field min-h-20 py-3 uppercase font-bold"
            placeholder="EJ: ENTRADA PRINCIPAL A 50M DE LA AUTOPISTA"
            maxLength={255}
          />
        </div>
      </div>

      {/* SECCIÓN 3: ESPECIFICACIONES TÉCNICAS */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border-main/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Settings size={18} />
          </div>
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Atributos Técnicos
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isSubstationSelected() && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                <Zap size={14} className="text-amber-500" /> Nivel de Tensión *
              </label>
              <select
                name="voltageLevel"
                required
                value={formData.voltageLevel}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input-field h-12 font-bold appearance-none cursor-pointer ${errors.voltageLevel ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
              >
                <option value="">Seleccione el nivel de tensión...</option>
                {voltageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.voltageLevel && (
                <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                  {errors.voltageLevel}
                </p>
              )}
            </div>
          )}
          <div
            className={`space-y-2 ${!isSubstationSelected() ? "col-span-2" : ""}`}
          >
            <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-2">
              <Globe size={14} className="text-corpoelec-blue" /> Coordenadas
              (LAT, LONG)
            </label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input-field h-12 font-mono ${errors.coordinates ? "border-corpoelec-red focus:border-corpoelec-red focus:ring-corpoelec-red/10" : ""}`}
              placeholder="EJ: 10° 29' 17'' N, 66° 52' 46'' O"
              maxLength={150}
            />
            {errors.coordinates ? (
              <p className="text-[10px] text-corpoelec-red font-black uppercase mt-1 ml-1 leading-tight">
                {errors.coordinates}
              </p>
            ) : (
              <p className="text-[9px] text-txt-muted font-bold tracking-tight mt-1 ml-1 uppercase">
                Opcional. Formato: Latitud, Longitud (ej: 12.3123, -73.3123)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: REGISTRO FOTOGRÁFICO (NUEVA) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-border-main/50">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Camera size={18} />
          </div>
          <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em]">
            Registro Fotográfico (Opcional)
          </h4>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images (if editing) */}
            {isEditing &&
              editingData.images?.map((img, idx) => (
                <div
                  key={`existing-${idx}`}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border-main bg-bg-main group"
                >
                  <img
                    src={`${window.BACKEND_URL || "http://localhost:3000"}${img.imageUrl}`}
                    alt="Facility"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">
                      Existente
                    </span>
                  </div>
                </div>
              ))}

            {/* New Previews */}
            {previews.map((preview, idx) => (
              <div
                key={`preview-${idx}`}
                className="relative aspect-square rounded-2xl overflow-hidden border border-corpoelec-blue/30 bg-bg-main shadow-md group animate-in zoom-in duration-200"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-corpoelec-red text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            <label className="relative aspect-square rounded-2xl border-2 border-dashed border-border-main hover:border-corpoelec-blue/50 bg-bg-main/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-bg-main group overflow-hidden">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center text-txt-muted group-hover:text-corpoelec-blue transition-colors">
                <Plus size={20} />
              </div>
              <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest">
                Cargar Fotos
              </span>
            </label>
          </div>
          <p className="text-[10px] text-txt-muted italic font-medium">
            Puedes seleccionar varias imágenes a la vez. Máximo 10MB por
            archivo.
          </p>
        </div>
      </div>

      {/* FOOTER ACCIONES */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-border-main/50">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 text-xs font-black text-txt-muted uppercase tracking-widest hover:text-txt-main hover:bg-bg-main rounded-xl transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-10 h-12 shadow-xl shadow-corpoelec-blue/20 min-w-[220px]"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin" />
              <span className="uppercase text-[10px] tracking-widest">
                Procesando...
              </span>
            </div>
          ) : (
            <span className="uppercase text-[10px] tracking-[0.2em]">
              {isEditing ? "Actualizar Registro" : "Guardar Instalación"}
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
