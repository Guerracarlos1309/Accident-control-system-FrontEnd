import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Building2,
  FileText,
  Loader2,
  Trash2,
  Edit2,
  List,
  Eye,
  Calendar,
  X,
  Code,
  Download,
  AlertCircle,
} from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function FacilityCodeManager() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");

  // Form State
  const [editingRecord, setEditingRecord] = useState(null);
  const [formFacilityId, setFormFacilityId] = useState("");
  const [formType, setFormType] = useState("I"); // "I" or "M"
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formSequence, setFormSequence] = useState(1);
  const [formCode, setFormCode] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);

  const api = helpFetch();
  const { showNotification } = useNotification();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [codesRes, facsRes] = await Promise.all([
        api.get("/facility-codes"),
        api.get("/facilities"),
      ]);

      if (Array.isArray(codesRes)) {
        setRecords(codesRes);
      }
      if (Array.isArray(facsRes)) {
        setFacilities(facsRes);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      showNotification("Error al cargar registros", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Fetch automatically generated code when type or date changes
  useEffect(() => {
    if (!isModalOpen || editingRecord) return; // Only auto-generate for new records

    const autoGenerateCode = async () => {
      if (!formType || !formDate) return;
      setGeneratingCode(true);
      try {
        const dateParts = formDate.split("-");
        const year = dateParts[0]
          ? parseInt(dateParts[0])
          : new Date().getFullYear();
        const res = await api.get(
          `/facility-codes/next-code?type=${formType}&year=${year}`,
        );
        if (res && !res.err) {
          setFormSequence(res.sequence);
          setFormCode(res.code);
        }
      } catch (error) {
        console.error("Error generating next code", error);
      } finally {
        setGeneratingCode(false);
      }
    };

    autoGenerateCode();
  }, [formType, formDate, isModalOpen, editingRecord]);

  const handleEdit = (record) => {
    setFormDate(record.date);
    setFormSequence(record.sequence);
    setFormCode(record.code);
    setFormNotes(record.notes || "");
    setFormFacilityId(record.facilityId);
    setFormType(record.type);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await api.del(`/facility-codes/${itemToDelete.id}`);
      if (res && !res.err) {
        showNotification("Registro de código eliminado", "success");
        fetchRecords();
        setItemToDelete(null);
      } else {
        showNotification("Error al eliminar el registro", "error");
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormFacilityId("");
    setFormType("I");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormSequence(1);
    setFormCode("");
    setFormNotes("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const parsedFacilityId = parseInt(formFacilityId);
    if (!formFacilityId || isNaN(parsedFacilityId)) {
      showNotification("Por favor, seleccione una instalación/sede", "warning");
      return;
    }
    if (!formCode || !formCode.trim()) {
      showNotification("El código es requerido", "warning");
      return;
    }

    setSavingRecord(true);
    try {
      const dateParts = formDate ? formDate.split("-") : [];
      const year =
        dateParts[0] && !isNaN(parseInt(dateParts[0]))
          ? parseInt(dateParts[0])
          : new Date().getFullYear();

      const sequence = parseInt(formSequence) || 1;

      const body = {
        facilityId: parsedFacilityId,
        type: formType,
        sequence: sequence,
        year,
        code: formCode.trim(),
        date: formDate || new Date().toISOString().split("T")[0],
        notes: formNotes,
      };

      let res;
      if (editingRecord) {
        res = await api.put(`/facility-codes/${editingRecord.id}`, { body });
      } else {
        res = await api.post("/facility-codes", { body });
      }

      if (res && !res.err) {
        showNotification(
          editingRecord
            ? "Código de control actualizado con éxito"
            : "Código de control generado y guardado",
          "success",
        );
        fetchRecords();
        handleModalClose();
      } else {
        showNotification(
          res.statusText || "Error al guardar el registro",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error al conectar con el servidor", "error");
    } finally {
      setSavingRecord(false);
    }
  };

  // Generate and download combined report: code metadata + resumen + inspections for the facility
  const handleDownloadReport = async (record) => {
    setDownloadingReportId(record.facilityId);
    showNotification(
      `Generando informe completo para ${record.facility?.name}...`,
      "info",
    );
    try {
      const safeName = (record.code || 'informe').replace(/[^a-zA-Z0-9\-_]/g, '_');
      const filename = `informe_completo_${safeName}.pdf`;

      await api.download(`/facility-codes/${record.id}/report`, filename);

      showNotification("Informe descargado con éxito", "success");
    } catch (error) {
      console.error("Error downloading combined report:", error);
      showNotification("Error al generar el informe", "error");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const filteredRecords = records.filter((r) => {
    const facilityName = r.facility?.name || "";
    const city = r.facility?.location?.parish?.city?.name || "";
    const parish = r.facility?.location?.parish?.name || "";

    const matchesSearch =
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFacility =
      !selectedFacilityFilter ||
      r.facilityId === parseInt(selectedFacilityFilter);
    const matchesType = !selectedTypeFilter || r.type === selectedTypeFilter;

    return matchesSearch && matchesFacility && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-main tracking-tighter flex items-center gap-3">
            <Code className="text-corpoelec-blue" />
            Códigos de Control y Registro de Sede
          </h2>
          <p className="text-txt-muted mt-1 text-xs font-bold uppercase tracking-widest">
            Generación y control de códigos únicos de inspección (I) y
            memorativo (M).
          </p>
        </div>

        {user?.role !== "Analista" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shadow-lg shadow-corpoelec-blue/20 w-full md:w-auto"
          >
            <Plus size={18} />
            <span className="uppercase text-[10px] tracking-widest">
              Nuevo Código
            </span>
          </button>
        )}
      </div>

      {/* Filter and search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="BUSCAR POR CÓDIGO, SEDE O NOTAS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field h-12 text-xs font-bold uppercase tracking-widest"
          />
        </div>

        <div>
          <select
            value={selectedFacilityFilter}
            onChange={(e) => setSelectedFacilityFilter(e.target.value)}
            className="input-field h-12 text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <option value="">TODAS LAS INSTALACIONES</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="input-field h-12 text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            <option value="">TODOS LOS TIPOS</option>
            <option value="I">INSPECCIÓN (I)</option>
            <option value="M">MEMORATIVO(M)</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={48} className="text-corpoelec-blue animate-spin" />
            <p className="text-txt-muted font-black uppercase tracking-[0.2em] text-[10px]">
              Cargando códigos de control...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[2.5rem] border-dashed border-border-main/50">
            <div className="w-20 h-20 rounded-full bg-bg-main flex items-center justify-center mx-auto mb-6">
              <Code size={40} className="text-txt-muted/30" />
            </div>
            <p className="text-txt-muted font-bold uppercase tracking-widest text-xs">
              No se encontraron códigos de control registrados.
            </p>
          </div>
        ) : (
          /* Table View */
          <div className="glass-panel rounded-[2rem] overflow-hidden border border-border-main/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/50 border-b border-border-main">
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Instalación
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Número de informe de Inspección
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Fecha del Informe
                    </th>

                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Número Memo de Remisión
                    </th>

                    <th className="px-6 py-5 text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Observaciones / Notas
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-txt-muted uppercase tracking-[0.2em]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-bg-main/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-black text-txt-main leading-none mb-1 group-hover:text-corpoelec-blue transition-colors">
                            {record.facility?.name || "Instalación Desconocida"}
                          </p>
                          <p className="text-[10px] text-txt-muted">
                            {record.facility?.location?.parish?.city?.name ||
                              "N/A"}
                            , {record.facility?.location?.parish?.name || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-corpoelec-blue font-mono tracking-wider">
                          {record.code}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-txt-main">
                        {new Date(record.date + "T00:00:00").toLocaleDateString(
                          "es-ES",
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest leading-none ${
                            record.type === "I"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {record.type === "I"
                            ? "Inspección (I)"
                            : "Memorativo (M)"}
                        </span>
                      </td>

                      <td className="px-6 py-4" style={{ maxWidth: '280px' }}>
                        {record.notes ? (
                          <div>
                            <p
                              className="text-xs text-txt-muted line-clamp-2 leading-relaxed"
                              title={record.notes}
                            >
                              {record.notes}
                            </p>
                            {record.notes.length > 120 && (
                              <span className="text-[9px] font-black text-corpoelec-blue uppercase tracking-wider mt-1 block">
                                Ver informe completo al editar
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/60">
                            Sin informe registrado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadReport(record)}
                            disabled={downloadingReportId === record.facilityId}
                            className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all flex items-center gap-1.5"
                            title="Generar Informe Completo (Código + Inspecciones)"
                          >
                            {downloadingReportId === record.facilityId ? (
                              <Loader2
                                size={16}
                                className="animate-spin text-corpoelec-blue"
                              />
                            ) : (
                              <Download size={16} />
                            )}
                            <span className="text-[9px] font-black uppercase tracking-wider hidden lg:inline">
                              Reporte
                            </span>
                          </button>
                          {user?.role !== "Analista" && (
                            <>
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setItemToDelete(record)}
                                className="p-2 rounded-lg text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
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

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          editingRecord
            ? "Editar Código de Control"
            : "Generación de Código de Control"
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Facility Sede */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                Instalación / Sede *
              </label>
              <select
                required
                value={formFacilityId}
                onChange={(e) => setFormFacilityId(e.target.value)}
                className="input-field h-12 text-xs font-bold uppercase tracking-widest cursor-pointer"
                disabled={!!editingRecord}
              >
                <option value="">SELECCIONE UNA INSTALACIÓN...</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} - {fac.location?.parish?.city?.name || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                  Tipo de Código *
                </label>
                <div className="flex gap-4 items-center h-12 bg-bg-surface border border-border-main px-4 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="formType"
                      value="I"
                      checked={formType === "I"}
                      onChange={() => setFormType("I")}
                      disabled={!!editingRecord}
                      className="accent-corpoelec-blue"
                    />
                    <span>INSPECCIÓN (I)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="radio"
                      name="formType"
                      value="M"
                      checked={formType === "M"}
                      onChange={() => setFormType("M")}
                      disabled={!!editingRecord}
                      className="accent-corpoelec-blue"
                    />
                    <span>MEMORANDO (M)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                  Fecha Registro *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="input-field h-12 text-xs font-bold"
                  disabled={!!editingRecord}
                />
              </div>
            </div>

            {/* Code Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                  Código Único Generado *
                </label>
                {generatingCode && (
                  <span className="text-[9px] font-black text-corpoelec-blue flex items-center gap-1 uppercase">
                    <Loader2 size={12} className="animate-spin" />
                    Generando...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="input-field h-12 text-sm font-black font-mono tracking-widest uppercase pl-4 pr-12"
                  placeholder="ASHO-TAC-X-000/YYYY"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">
                  <Code size={18} />
                </div>
              </div>
              <p className="text-[9px] text-txt-muted font-semibold uppercase tracking-wider">
                El sistema autogenera el formato{" "}
                <span className="text-corpoelec-blue font-mono font-bold">
                  ASHO-TAC-[I/M]-[CORRELATIVO]/[AÑO]
                </span>
                . Puede editarlo si lo desea, pero debe ser único.
              </p>
            </div>

            {/* Notes/Observations - Informe */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                Informe / Notas y Observaciones
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={12}
                placeholder="Redacte aquí el informe completo de la inspección o mantenimiento. Incluya hallazgos, condiciones observadas, recomendaciones, responsables y cualquier dato relevante del proceso..."
                className="input-field py-3 text-sm font-normal leading-relaxed resize-y min-h-[200px]"
                style={{ textTransform: 'none', letterSpacing: 'normal' }}
              />
              <p className="text-[9px] text-txt-muted font-semibold uppercase tracking-wider">
                Este campo admite texto libre y extenso. Puede usar este espacio para el informe técnico completo.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main/50">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn-secondary h-11"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingRecord || generatingCode}
              className="btn-primary h-11 px-8"
            >
              {savingRecord ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Guardar Registro"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Está seguro de que desea eliminar el código de control "${itemToDelete?.code}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Código"
        variant="danger"
      />
    </div>
  );
}
