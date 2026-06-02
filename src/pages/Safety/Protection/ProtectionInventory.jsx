import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Edit,
  Package,
  Layers,
  Search,
  Loader2,
  Calendar,
  Building,
  Tag,
  Boxes,
  ClipboardList,
} from "lucide-react";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";
import EquipmentForm from "./EquipmentForm";
import Modal from "../../../components/Modal";
import { useNavigate } from "react-router-dom";

export default function ProtectionInventory() {
  const api = helpFetch();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [categories, setCategories] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("TODOS"); // TODOS | EPP | EPC

  const loadData = async () => {
    setLoading(true);
    try {
      const [catsRes, equipRes] = await Promise.all([
        api.get("/lookups/protection-equipment-categories"),
        api.get("/protection/equipment"),
      ]);

      if (catsRes && !catsRes.err) {
        setCategories(catsRes);
      } else {
        showNotification("Error al cargar categorías de EPP/EPC", "error");
      }

      if (equipRes && !equipRes.err) {
        setEquipmentList(equipRes);
      }
    } catch (error) {
      showNotification("Error de conexión al servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    const isEditing = !!editingEquipment && editingEquipment.id !== null;
    const url = isEditing
      ? `/protection/equipment/${editingEquipment.id}`
      : "/protection/equipment";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await api[method.toLowerCase()](url, { body: payload });
      if (res && !res.err) {
        showNotification(
          "Especificación de equipo guardada con éxito",
          "success",
        );
        setIsModalOpen(false);
        setEditingEquipment(null);
        loadData();
      } else {
        showNotification(
          res.statusText || "Error al procesar el guardado",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error al enviar datos al servidor", "error");
    }
  };

  // Helper to extract bodily classification from packed description string
  const getClassification = (descriptionStr, isEPC) => {
    if (isEPC) return "OTROS";

    if (descriptionStr && descriptionStr.includes("CLASIF:")) {
      const parts = descriptionStr.split(" | ");
      const clasifPart = parts.find((p) => p.startsWith("CLASIF:"));
      if (clasifPart) {
        return clasifPart.split(": ")[1] || "OTROS";
      }
    }
    return "OTROS";
  };

  // Helper to extract clean tech specifications from packed description string
  const getCleanSpecs = (descriptionStr) => {
    if (!descriptionStr) return "N/A";

    if (descriptionStr.includes("MARCA:")) {
      const parts = descriptionStr.split(" | ");
      const specs = parts.filter((p) => !p.startsWith("CLASIF:"));
      return specs.join(" | ");
    }
    return descriptionStr;
  };

  // Merge the 38 official categories with any configured user specifications
  const mergedEquipment = categories.map((cat) => {
    const config = equipmentList.find((eq) => eq.categoryId === cat.id);
    const isEPP = cat.protectionTypeId === 1;
    const defaultClassification = isEPP ? "CABEZA" : "OTROS";

    return {
      id: config ? config.id : null,
      categoryId: cat.id,
      name: cat.name,
      category: cat,
      description: config
        ? config.description
        : `CLASIF: ${defaultClassification} | MARCA: GENÉRICO | MODELO: N/A | COD: S/N`,
      lastUpdate: config
        ? config.lastUpdate
        : new Date().toISOString().split("T")[0],
    };
  });

  // Filter list by search term and EPP/EPC category types
  const filteredEquipment = mergedEquipment.filter((item) => {
    const isEPP = item.category?.protectionTypeId === 1;
    const classification = getClassification(item.description, !isEPP);
    const cleanSpecs = getCleanSpecs(item.description);

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleanSpecs.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "TODOS" ||
      (activeTab === "EPP" && isEPP) ||
      (activeTab === "EPC" && !isEPP);

    return matchesSearch && matchesTab;
  });

  // Calculate live Stock statistics (Counts of registered unique items/models)
  const totalItemsCount = mergedEquipment.length;
  const totalEPPCount = mergedEquipment.filter(
    (item) => item.category?.protectionTypeId === 1,
  ).length;
  const totalEPCCount = mergedEquipment.filter(
    (item) => item.category?.protectionTypeId === 2,
  ).length;
  const configuredItems = equipmentList.length;

  // Render Bodily Classification badge
  const renderClassificationBadge = (classification) => {
    const upper = classification.toUpperCase();
    let style = "bg-slate-500/10 text-slate-500 border-slate-500/15";
    let label = "OTROS / GRAL";

    if (upper === "CABEZA") {
      style = "bg-sky-500/10 text-sky-500 border-sky-500/15";
      label = "👤 CABEZA";
    } else if (upper === "PECHO") {
      style = "bg-emerald-500/10 text-emerald-500 border-emerald-500/15";
      label = "🎽 PECHO";
    } else if (upper === "PIERNAS") {
      style = "bg-purple-500/10 text-purple-500 border-purple-500/15";
      label = "👖 PIERNAS";
    } else if (upper === "PIES") {
      style = "bg-amber-500/10 text-amber-500 border-amber-500/15";
      label = "🥾 PIES";
    }

    return (
      <span
        className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${style}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-txt-main">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-corpoelec-blue/10 flex items-center justify-center text-corpoelec-blue border border-corpoelec-blue/20 shadow-sm shrink-0">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-txt-main tracking-tighter">
              Catálogo de Equipos Existentes
            </h2>
            <p className="text-txt-muted text-xs md:text-sm">
              Lista oficial ASHO de los 38 equipos de protección. Seleccione un
              material para configurar su especificación de fabricante y
              clasificación corporal.
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto"></div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-black tracking-tighter">
        <StatCard
          label="Total Renglones Oficiales"
          value={totalItemsCount}
          icon={Boxes}
          color="text-corpoelec-blue bg-corpoelec-blue/10 border-corpoelec-blue/20"
          subtitle="Formulario ASHO"
        />
        <StatCard
          label="Equipos EPP"
          value={totalEPPCount}
          icon={Layers}
          color="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Protección Personal (1-23)"
        />
        <StatCard
          label="Equipos EPC"
          value={totalEPCCount}
          icon={Building}
          color="text-purple-500 bg-purple-500/10 border-purple-500/20"
          subtitle="Protección Colectiva (24-38)"
        />
        <StatCard
          label="Renglones Configurados"
          value={configuredItems}
          icon={Tag}
          color="text-amber-500 bg-amber-500/10 border-amber-500/20"
          subtitle="Detalles personalizados"
        />
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Buscar por descripción, marca, serial o clasificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11 h-12 border border-border-main focus:border-corpoelec-blue text-xs uppercase"
          />
        </div>

        {/* Tab selector */}
        <div className="flex bg-bg-main/30 p-1.5 rounded-2xl border border-border-main/50 w-full md:w-auto">
          {[
            { id: "TODOS", label: "Ver Todos" },
            { id: "EPP", label: "EPP (Personal)" },
            { id: "EPC", label: "EPC (Colectivo)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-initial px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl cursor-pointer ${
                activeTab === tab.id
                  ? "bg-corpoelec-blue text-white shadow-md shadow-corpoelec-blue/15"
                  : "text-txt-muted hover:text-txt-main"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DATA CATALOG TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-txt-muted">
          <Loader2 size={36} className="animate-spin text-corpoelec-blue" />
          <p className="text-[10px] font-black uppercase tracking-widest">
            Cargando catálogo oficial...
          </p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                  <th className="px-8 py-5 w-16 text-center">Renglón</th>
                  <th className="px-8 py-5">Nombre Oficial del Material</th>
                  <th className="px-8 py-5">Clasificación Corporal</th>
                  <th className="px-8 py-5">Especificación Técnica / Serial</th>
                  <th className="px-8 py-5 text-center w-36">Tipo</th>
                  <th className="px-8 py-5 text-center w-36">Unidad</th>
                  <th className="px-8 py-5 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/20">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-16 text-txt-muted"
                    >
                      <ShieldAlert
                        size={36}
                        className="mx-auto mb-3 opacity-25 text-txt-muted"
                      />
                      <p className="font-black uppercase tracking-widest text-xs">
                        Sin registros encontrados
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => {
                    const isEPP = item.category?.protectionTypeId === 1;
                    const classification = getClassification(
                      item.description,
                      !isEPP,
                    );
                    const cleanSpecs = getCleanSpecs(item.description);
                    const isConfigured = item.id !== null;

                    return (
                      <tr
                        key={item.categoryId}
                        className="hover:bg-bg-main/5 transition-colors group"
                      >
                        {/* Category ID as Renglón */}
                        <td className="px-8 py-5 text-center text-xs font-mono font-bold text-txt-muted">
                          {item.categoryId.toString().padStart(2, "0")}
                        </td>

                        {/* Name */}
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-txt-main group-hover:text-corpoelec-blue transition-colors uppercase leading-tight">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        {/* Body Classification Badge */}
                        <td className="px-8 py-5">
                          {renderClassificationBadge(classification)}
                        </td>

                        {/* Description / Brand info */}
                        <td className="px-8 py-5">
                          <span
                            className={`text-xs font-semibold uppercase ${isConfigured ? "text-txt-sub font-semibold" : "text-txt-muted/40 font-normal italic"}`}
                          >
                            {cleanSpecs}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="px-8 py-5 text-center">
                          <span
                            className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              isEPP
                                ? "bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/15"
                                : "bg-purple-500/10 text-purple-500 border border-purple-500/15"
                            }`}
                          >
                            {isEPP ? "EPP" : "EPC"}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="px-8 py-5 text-center">
                          <span className="text-[9px] font-black uppercase text-txt-muted bg-bg-main/30 px-2 py-0.5 rounded border border-border-main/50 tracking-wider">
                            {item.category?.description || "PIEZAS"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              isConfigured
                                ? "border-border-main text-txt-muted hover:text-corpoelec-blue hover:border-corpoelec-blue/20 hover:bg-corpoelec-blue/5"
                                : "border-amber-500/30 text-amber-500 hover:text-amber-600 hover:border-amber-500/50 hover:bg-amber-500/5 animate-pulse"
                            }`}
                            title={
                              isConfigured
                                ? "Editar especificación"
                                : "Configurar especificación técnica"
                            }
                          >
                            <Edit size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PORTAL MODAL INTEGRATION */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingEquipment?.id !== null
            ? "Editar Especificación de Equipo"
            : "Configurar Especificación de Equipo"
        }
        maxWidth="max-w-2xl"
      >
        <EquipmentForm
          initialData={editingEquipment}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-bg-surface border border-border-main p-5 rounded-3xl flex items-center gap-4.5 shadow-sm hover:shadow-md hover:border-corpoelec-blue/20 transition-all">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${color} shadow-sm shrink-0`}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] font-black text-txt-muted uppercase tracking-[0.15em] mb-0.5">
          {label}
        </div>
        <div className="text-xl font-black text-txt-main leading-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-[8px] font-bold text-txt-muted uppercase tracking-wider mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
