import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Building2,
  FileText,
  Loader2,
  Trash2,
  Edit2,
  X,
  Code,
  Download,
  Filter,
  RefreshCw,
  FileUp,
} from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import { helpFetch } from "../../helpers/helpFetch";
import { useNotification } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function FacilityCodeManager() {
  const { user } = useAuth();
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [records, setRecords] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");

  const [dateFilterTarget, setDateFilterTarget] = useState("date"); // "date" (Informe) or "inspectionDate" (Inspección)
  const [dateFilterType, setDateFilterType] = useState("all"); // "all", "specific", "month", "quarter", "year"
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("");
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState(""); // "1", "2", "3", "4"
  const [selectedQuarterYearFilter, setSelectedQuarterYearFilter] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedYearFilter, setSelectedYearFilter] = useState(
    new Date().getFullYear().toString(),
  );

  // Form State
  const [editingRecord, setEditingRecord] = useState(null);
  const [formFacilityId, setFormFacilityId] = useState("");
  const [formType, setFormType] = useState("I"); // "I" or "M" or "C"
  const [formDate, setFormDate] = useState(""); // Report Date (nullable)
  const [formInspectionDate, setFormInspectionDate] = useState(""); // Inspection Date (nullable)
  const [formMemoNumber, setFormMemoNumber] = useState(""); // Memo (nullable)
  const [formMemoDate, setFormMemoDate] = useState(""); // Memo date (nullable)
  const [formNotes, setFormNotes] = useState(""); // Observations (nullable)

  // PDF state
  const [formPdfFile, setFormPdfFile] = useState(null);
  const [formExistingPdf, setFormExistingPdf] = useState(null);
  const [formDeletePdf, setFormDeletePdf] = useState(false);

  const [formPdfFile2, setFormPdfFile2] = useState(null);
  const [formExistingPdf2, setFormExistingPdf2] = useState(null);
  const [formDeletePdf2, setFormDeletePdf2] = useState(false);

  const [formSequence, setFormSequence] = useState(1);
  const [formCode, setFormCode] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const api = helpFetch();
  const { showNotification } = useNotification();

  // Years derived from loaded records (both report date and inspection date)
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from(
    new Set(
      records
        .flatMap((r) => [
          r.date ? parseInt(r.date.slice(0, 4)) : null,
          r.inspectionDate ? parseInt(r.inspectionDate.slice(0, 4)) : null,
        ])
        .filter((y) => y !== null && !isNaN(y)),
    ),
  ).sort((a, b) => b - a); // most recent first

  // Fallback: if no records yet, show current year
  const yearsListFinal = yearsList.length > 0 ? yearsList : [currentYear];

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
      if (!formType) return;
      setGeneratingCode(true);
      try {
        let year = new Date().getFullYear();
        if (formDate) {
          const dateParts = formDate.split("-");
          if (dateParts[0]) {
            year = parseInt(dateParts[0]);
          }
        }
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

  // Auto-fill memo number with fixed M prefix for new records
  useEffect(() => {
    if (formSequence && !editingRecord) {
      let year = new Date().getFullYear();
      if (formDate) {
        const dateParts = formDate.split("-");
        if (dateParts[0]) {
          year = parseInt(dateParts[0]);
        }
      }
      const paddedSeq = String(formSequence).padStart(3, "0");
      setFormMemoNumber(`ASHO-TAC-M-${paddedSeq}/${year}`);
    }
  }, [formSequence, formDate, editingRecord]);

  const handleEdit = (record) => {
    setFormDate(record.date || "");
    setFormInspectionDate(record.inspectionDate || "");
    setFormMemoNumber(record.memoNumber || "");
    setFormMemoDate(record.memoDate || "");
    setFormSequence(record.sequence);
    setFormCode(record.code);
    setFormNotes(record.notes || "");
    setFormFacilityId(record.facilityId ? String(record.facilityId) : "");
    setFormType(record.type);
    setFormExistingPdf(record.pdfPath || null);
    setFormDeletePdf(false);
    setFormPdfFile(null);
    setFormExistingPdf2(record.pdfPath2 || null);
    setFormDeletePdf2(false);
    setFormPdfFile2(null);
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
    setFormDate("");
    setFormInspectionDate("");
    setFormMemoNumber("");
    setFormMemoDate("");
    setFormSequence(1);
    setFormCode("");
    setFormNotes("");
    setFormPdfFile(null);
    setFormExistingPdf(null);
    setFormDeletePdf(false);
    setFormPdfFile2(null);
    setFormExistingPdf2(null);
    setFormDeletePdf2(false);
  };

  const handleOpenNewModal = () => {
    setFormDate("");
    setFormInspectionDate("");
    setFormMemoNumber("");
    setFormMemoDate("");
    setFormSequence(1);
    setFormCode("");
    setFormNotes("");
    setFormFacilityId("");
    setFormType("I");
    setFormExistingPdf(null);
    setFormDeletePdf(false);
    setFormPdfFile(null);
    setFormExistingPdf2(null);
    setFormDeletePdf2(false);
    setFormPdfFile2(null);
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formCode || !formCode.trim()) {
      showNotification("El código es requerido", "warning");
      return;
    }

    setSavingRecord(true);
    try {
      const data = new FormData();
      data.append("facilityId", formFacilityId || ""); // will map to null in backend if empty
      data.append("type", formType);
      data.append("sequence", formSequence);

      const dateParts = formDate ? formDate.split("-") : [];
      const year =
        dateParts[0] && !isNaN(parseInt(dateParts[0]))
          ? parseInt(dateParts[0])
          : new Date().getFullYear();

      data.append("year", year);
      data.append("code", formCode.trim());
      data.append("date", formDate || "");
      data.append("inspectionDate", formInspectionDate || "");
      data.append("memoNumber", formMemoNumber || "");
      data.append("memoDate", formMemoDate || "");
      data.append("notes", formNotes || "");

      if (formPdfFile) {
        data.append("pdfFile", formPdfFile);
      }
      if (formPdfFile2) {
        data.append("pdfFile2", formPdfFile2);
      }

      if (editingRecord) {
        data.append("deletePdf", formDeletePdf);
        data.append("deletePdf2", formDeletePdf2);
      }

      let res;
      if (editingRecord) {
        res = await api.put(`/facility-codes/${editingRecord.id}`, {
          body: data,
        });
      } else {
        res = await api.post("/facility-codes", { body: data });
      }

      if (res && !res.err) {
        showNotification(
          editingRecord
            ? "Registro de control actualizado con éxito"
            : "Registro de control generado y guardado",
          "success",
        );
        fetchRecords();
        handleModalClose();
      } else {
        showNotification(
          res.statusText || res.message || "Error al guardar el registro",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error al conectar con el servidor", "error");
    } finally {
      setSavingRecord(false);
    }
  };

  // Reset all filters (Listado general)
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedFacilityFilter("");
    setSelectedTypeFilter("");
    setDateFilterType("all");
    setSelectedDateFilter("");
    setSelectedMonthFilter("");
    setSelectedQuarterFilter("");
    setSelectedQuarterYearFilter(new Date().getFullYear().toString());
    setSelectedYearFilter(new Date().getFullYear().toString());
  };

  // Generate and download combined report: code metadata + resumen + inspections for the facility
  const handleDownloadReport = async (record) => {
    if (!record.facilityId) {
      showNotification(
        "Este registro no tiene instalación vinculada para generar reporte",
        "warning",
      );
      return;
    }
    setDownloadingReportId(record.id);
    showNotification(
      `Generando informe completo para ${record.facility?.name || "Sede"}...`,
      "info",
    );
    try {
      const safeName = (record.code || "informe").replace(
        /[^a-zA-Z0-9\-_]/g,
        "_",
      );
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES");
  };

  const filteredRecords = records.filter((r) => {
    const facilityName = r.facility?.name || "";
    const city = r.facility?.location?.parish?.city?.name || "";
    const parish = r.facility?.location?.parish?.name || "";
    const memo = r.memoNumber || "";
    const notes = r.notes || "";
    const code = r.code || "";

    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFacility =
      !selectedFacilityFilter ||
      r.facilityId === parseInt(selectedFacilityFilter);

    const matchesType = !selectedTypeFilter || r.type === selectedTypeFilter;

    // Date filters
    const targetDateStr = r[dateFilterTarget]; // dateFilterTarget is 'date' or 'inspectionDate'
    let matchesDate = true;

    if (dateFilterType !== "all") {
      if (!targetDateStr) {
        matchesDate = false;
      } else {
        const recordDate = new Date(targetDateStr + "T00:00:00");
        const rYear = recordDate.getFullYear();
        const rMonth = recordDate.getMonth() + 1; // 1-12

        if (dateFilterType === "specific") {
          matchesDate = targetDateStr === selectedDateFilter;
        } else if (dateFilterType === "month") {
          if (selectedMonthFilter) {
            const [yearStr, monthStr] = selectedMonthFilter.split("-");
            matchesDate =
              rYear === parseInt(yearStr) && rMonth === parseInt(monthStr);
          }
        } else if (dateFilterType === "quarter") {
          if (selectedQuarterFilter && selectedQuarterYearFilter) {
            const quarter = parseInt(selectedQuarterFilter);
            const year = parseInt(selectedQuarterYearFilter);
            const quarterMonths = {
              1: [1, 2, 3],
              2: [4, 5, 6],
              3: [7, 8, 9],
              4: [10, 11, 12],
            }[quarter];
            matchesDate = rYear === year && quarterMonths.includes(rMonth);
          }
        } else if (dateFilterType === "year") {
          if (selectedYearFilter) {
            matchesDate = rYear === parseInt(selectedYearFilter);
          }
        }
      }
    }

    return matchesSearch && matchesFacility && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-txt-main tracking-tighter flex items-center gap-3">
            <Code className="text-corpoelec-blue" />
            Control de Inspecciones y Registro de Sede
          </h2>
          <p className="text-txt-muted mt-1 text-xs font-bold uppercase tracking-widest">
            Módulo rediseñado para el control de informes y carga de reportes
            PDF.
          </p>
        </div>

        {user?.role !== "Analista" && (
          <button
            onClick={handleOpenNewModal}
            className="btn-primary shadow-lg shadow-corpoelec-blue/20 w-full md:w-auto"
          >
            <Plus size={18} />
            <span className="uppercase text-[10px] tracking-widest">
              Nuevo Registro
            </span>
          </button>
        )}
      </div>

      {/* Panel de Filtros */}
      <div className="glass-panel rounded-[2rem] p-6 border border-border-main/50 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-main/30 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="text-corpoelec-blue" size={18} />
            <h3 className="text-xs font-black text-txt-main uppercase tracking-widest">
              Panel de Filtros y Búsqueda
            </h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="btn-secondary h-9 px-4 py-0 text-[9px] uppercase tracking-[0.2em] flex items-center gap-2"
          >
            <RefreshCw size={12} />
            Listado General
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Col 1: Búsqueda General y Tipo de Código */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Búsqueda General
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="BUSCAR CÓDIGO, MEMO O NOTAS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field h-11 text-xs font-bold uppercase tracking-widest"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted/50 pointer-events-none">
                  <Search size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Tipo de Código
              </label>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="input-field h-11 text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <option value="">TODOS LOS TIPOS</option>
                <option value="I">INSPECCIÓN (I)</option>
                <option value="C">CARACTERIZACIÓN (C)</option>
              </select>
            </div>
          </div>

          {/* Col 2: Instalación y Criterio de Fecha */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Instalación / Sede
              </label>
              <select
                value={selectedFacilityFilter}
                onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                className="input-field h-11 text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <option value="">TODAS LAS INSTALACIONES</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Criterio de Fecha
              </label>
              <select
                value={dateFilterTarget}
                onChange={(e) => setDateFilterTarget(e.target.value)}
                className="input-field h-11 text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <option value="date">FECHA DEL INFORME</option>
                <option value="inspectionDate">FECHA DE LA INSPECCIÓN</option>
              </select>
            </div>
          </div>

          {/* Col 3: Rango de Fecha */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Frecuencia / Rango
              </label>
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className="input-field h-11 text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                <option value="all">TODAS LAS FECHAS</option>
                <option value="specific">FECHA ESPECÍFICA</option>
                <option value="month">MENSUAL (MES)</option>
                <option value="quarter">TRIMESTRAL</option>
                <option value="year">ANUAL</option>
              </select>
            </div>

            {/* Conditionally rendered details for frequency */}
            {dateFilterType === "specific" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Seleccionar Fecha
                </label>
                <input
                  type="date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  max={todayStr}
                  className="input-field h-11 text-xs font-bold"
                />
              </div>
            )}

            {dateFilterType === "month" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Seleccionar Mes
                </label>
                <input
                  type="month"
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="input-field h-11 text-xs font-bold"
                />
              </div>
            )}

            {dateFilterType === "quarter" && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                    Trimestre
                  </label>
                  <select
                    value={selectedQuarterFilter}
                    onChange={(e) => setSelectedQuarterFilter(e.target.value)}
                    className="input-field h-11 text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    <option value="">ELEGIR...</option>
                    <option value="1">I TRIM (ENE-MAR)</option>
                    <option value="2">II TRIM (ABR-JUN)</option>
                    <option value="3">III TRIM (JUL-SEP)</option>
                    <option value="4">IV TRIM (OCT-DIC)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                    Año
                  </label>
                  <select
                    value={selectedQuarterYearFilter}
                    onChange={(e) =>
                      setSelectedQuarterYearFilter(e.target.value)
                    }
                    className="input-field h-11 text-xs font-bold cursor-pointer"
                  >
                    {yearsListFinal.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {dateFilterType === "year" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Seleccionar Año
                </label>
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="input-field h-11 text-xs font-bold cursor-pointer"
                >
                  {yearsListFinal.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={48} className="text-corpoelec-blue animate-spin" />
            <p className="text-txt-muted font-black uppercase tracking-[0.2em] text-[10px]">
              Cargando registros de control...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[2.5rem] border-dashed border-border-main/50">
            <div className="w-20 h-20 rounded-full bg-bg-main flex items-center justify-center mx-auto mb-6">
              <Code size={40} className="text-txt-muted/30" />
            </div>
            <p className="text-txt-muted font-bold uppercase tracking-widest text-xs">
              No se encontraron registros de inspección con los filtros
              aplicados.
            </p>
          </div>
        ) : (
             <div className="glass-panel rounded-[2rem] overflow-hidden border border-border-main/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-bg-main/50 border-b border-border-main">
                    <th className="w-[18%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Instalación
                    </th>
                    <th className="w-[11%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Fecha Insp.
                    </th>
                    <th className="w-[15%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Nro. Informe
                    </th>
                    <th className="w-[10%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Fecha Inf.
                    </th>
                    <th className="w-[13%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Memo Entrega
                    </th>
                    <th className="w-[10%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Fecha Memo
                    </th>
                    <th className="w-[8%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      PDF
                    </th>
                    <th className="w-[15%] px-3 py-4 text-[9px] font-black text-txt-muted uppercase tracking-widest">
                      Observaciones
                    </th>
                    <th className="w-[10%] px-3 py-4 text-right text-[9px] font-black text-txt-muted uppercase tracking-widest">
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
                      {/* Sede */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        {record.facility ? (
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-txt-main truncate leading-tight mb-0.5 group-hover:text-corpoelec-blue transition-colors" title={record.facility.name}>
                              {record.facility.name}
                            </p>
                            <p className="text-[9px] text-txt-muted truncate">
                              {record.facility.location?.parish?.city?.name || "N/A"}, {record.facility.location?.parish?.name || "N/A"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/60">
                            Sin sede vinculada
                          </span>
                        )}
                      </td>

                      {/* Fecha de la Inspección */}
                      <td className="px-3 py-3.5 text-xs font-bold text-txt-main whitespace-nowrap">
                        {record.inspectionDate ? (
                          formatDate(record.inspectionDate)
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/50">
                            —
                          </span>
                        )}
                      </td>

                      {/* Código de control */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span
                            className="text-[11px] font-black text-corpoelec-blue font-mono tracking-wider truncate"
                            title={record.code}
                          >
                            {record.code}
                          </span>
                          <span
                            className={`text-[8px] font-black px-1 py-0.5 rounded border uppercase tracking-wider self-start leading-none truncate whitespace-nowrap ${
                              record.type === "I"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : record.type === "C"
                                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {record.type === "I"
                              ? "Inspección"
                              : record.type === "C"
                                ? "Caracteriz."
                                : "Memorando"}
                          </span>
                        </div>
                      </td>

                      {/* Fecha del Informe */}
                      <td className="px-3 py-3.5 text-xs font-bold text-txt-main whitespace-nowrap">
                        {record.date ? (
                          formatDate(record.date)
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/50">
                            —
                          </span>
                        )}
                      </td>

                      {/* Memo de entrega */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        {record.memoNumber ? (
                          <span
                            className="inline-block font-mono font-black tracking-wider bg-corpoelec-blue/8 text-corpoelec-blue px-2 py-0.5 rounded border border-corpoelec-blue/10 text-[9px] truncate max-w-full"
                            title={record.memoNumber}
                          >
                            {record.memoNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/50">
                            —
                          </span>
                        )}
                      </td>

                      {/* Fecha del Memo */}
                      <td className="px-3 py-3.5 text-xs font-bold text-txt-main whitespace-nowrap">
                        {record.memoDate ? (
                          formatDate(record.memoDate)
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/50">
                            —
                          </span>
                        )}
                      </td>

                      {/* PDF Adjunto */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-1 min-w-0">
                          {record.pdfPath ? (
                            <a
                              href={`${window.BACKEND_URL || "http://localhost:3000"}${record.pdfPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 bg-red-500/10 text-corpoelec-red hover:bg-red-500/20 rounded border border-red-500/25 transition-all text-[8px] font-black uppercase tracking-wider w-fit"
                            >
                              <FileText size={10} />
                              <span>PDF 1</span>
                            </a>
                          ) : null}

                          {record.pdfPath2 ? (
                            <a
                              href={`${window.BACKEND_URL || "http://localhost:3000"}${record.pdfPath2}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 bg-red-500/10 text-corpoelec-red hover:bg-red-500/20 rounded border border-red-500/25 transition-all text-[8px] font-black uppercase tracking-wider w-fit"
                            >
                              <FileText size={10} />
                              <span>PDF 2</span>
                            </a>
                          ) : null}

                          {!record.pdfPath && !record.pdfPath2 ? (
                            <span className="text-[8px] font-semibold text-txt-muted/40 uppercase tracking-wider">
                              —
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Observaciones */}
                      <td className="px-3 py-3.5 overflow-hidden">
                        {record.notes ? (
                          <p
                            className="text-[11px] text-txt-muted truncate leading-normal"
                            title={record.notes}
                          >
                            {record.notes}
                          </p>
                        ) : (
                          <span className="text-[10px] italic text-txt-muted/40">
                            —
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-3 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownloadReport(record)}
                            disabled={
                              downloadingReportId === record.id ||
                              !record.facilityId
                            }
                            className="p-1.5 rounded text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all disabled:opacity-30"
                            title="Informe Completo"
                          >
                            {downloadingReportId === record.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin text-corpoelec-blue"
                              />
                            ) : (
                              <Download size={14} />
                            )}
                          </button>
                          {user?.role !== "Analista" && (
                            <>
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-1.5 rounded text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 transition-all"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setItemToDelete(record)}
                                className="p-1.5 rounded text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 transition-all"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
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
            ? "Editar Registro de Inspección"
            : "Nuevo Registro / Generación de Código"
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sede / Instalación */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Instalación / Sede
              </label>
              <select
                value={formFacilityId}
                onChange={(e) => setFormFacilityId(e.target.value)}
                className="input-field h-12 text-xs font-bold uppercase tracking-widest cursor-pointer"
                disabled={!!editingRecord}
                required
              >
                <option value="">SELECCIONE UNA INSTALACIÓN...</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} - {fac.location?.parish?.city?.name || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Código — pill selector */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Tipo de Registro
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "I",
                    label: "Inspección",
                    letter: "I",
                    active:
                      "bg-emerald-500/15 border-emerald-500/50 text-emerald-500",
                    inactive:
                      "border-border-main text-txt-muted hover:border-emerald-500/30 hover:text-emerald-500/70",
                  },
                  {
                    value: "C",
                    label: "Caracterización",
                    letter: "C",
                    active:
                      "bg-violet-500/15 border-violet-500/50 text-violet-400",
                    inactive:
                      "border-border-main text-txt-muted hover:border-violet-500/30 hover:text-violet-400/70",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!!editingRecord}
                    onClick={() => setFormType(opt.value)}
                    className={`relative flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 font-black transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${
                      formType === opt.value
                        ? opt.active
                        : `bg-bg-surface ${opt.inactive}`
                    }`}
                  >
                    <span className="text-lg leading-none">{opt.letter}</span>
                    <span className="text-[9px] uppercase tracking-widest leading-none">
                      {opt.label}
                    </span>
                    {formType === opt.value && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha de Inspección */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Fecha de la Inspección (Opcional)
              </label>
              <input
                type="date"
                value={formInspectionDate}
                onChange={(e) => setFormInspectionDate(e.target.value)}
                max={todayStr}
                className="input-field h-12 text-xs font-bold"
              />
            </div>

            {/* Fecha del Informe */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Fecha del Informe (Opcional)
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                max={todayStr}
                className="input-field h-12 text-xs font-bold"
              />
            </div>

            {/* Código Único Generado */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Código Único Generado
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
              <p className="text-[9px] text-txt-muted font-semibold uppercase tracking-wider ml-1">
                El sistema autogenera el formato{" "}
                <span className="text-corpoelec-blue font-mono font-bold">
                  ASHO-TAC-[I/C]-[CORRELATIVO]/[AÑO]
                </span>
                . Puede editarlo si lo desea, pero debe ser único.
              </p>
            </div>

            {/* Memo de entrega + Fecha de memo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Memo de Entrega / Número de Memo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="EJ: ASHO-TAC-M-001/2026"
                  value={formMemoNumber}
                  onChange={(e) => setFormMemoNumber(e.target.value)}
                  className="input-field h-12 text-xs font-bold uppercase tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                  Fecha de Asignación del Memo (Opcional)
                </label>
                <input
                  type="date"
                  value={formMemoDate}
                  onChange={(e) => setFormMemoDate(e.target.value)}
                  max={todayStr}
                  className="input-field h-12 text-xs font-bold"
                />
              </div>
            </div>

            {/* PDF Upload Area 1 */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Documento PDF Adjunto 1 (Opcional)
              </label>

              {formExistingPdf && !formDeletePdf ? (
                <div className="flex items-center justify-between p-4 bg-bg-main/50 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="text-emerald-500" size={24} />
                    <div>
                      <p className="text-xs font-bold text-txt-main">
                        Archivo PDF 1 cargado
                      </p>
                      <a
                        href={`${window.BACKEND_URL || "http://localhost:3000"}${formExistingPdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-corpoelec-blue font-black uppercase tracking-wider hover:underline"
                      >
                        Ver archivo PDF actual
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormDeletePdf(true)}
                    className="p-2 rounded-lg text-corpoelec-red hover:bg-corpoelec-red/10 transition-colors"
                    title="Remover PDF actual"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-main hover:border-corpoelec-blue/50 bg-bg-surface hover:bg-bg-main/30 rounded-xl cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormPdfFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <FileUp
                      className="text-txt-muted group-hover:text-corpoelec-blue transition-colors mb-2"
                      size={24}
                    />
                    {formPdfFile ? (
                      <div className="text-center">
                        <span className="text-xs font-bold text-corpoelec-blue uppercase break-all block px-4">
                          {formPdfFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormPdfFile(null);
                          }}
                          className="text-[9px] font-black text-corpoelec-red uppercase block mx-auto mt-2 hover:underline tracking-wider"
                        >
                          Quitar archivo seleccionado
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs font-bold text-txt-main group-hover:text-corpoelec-blue transition-colors block">
                          SELECCIONAR ARCHIVO PDF DE INSPECCIÓN 1
                        </span>
                        <span className="text-[9px] text-txt-muted uppercase tracking-wider block mt-1">
                          Solo se permiten archivos PDF (Límite 20MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* PDF Upload Area 2 */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Documento PDF Adjunto 2 (Opcional)
              </label>

              {formExistingPdf2 && !formDeletePdf2 ? (
                <div className="flex items-center justify-between p-4 bg-bg-main/50 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="text-emerald-500" size={24} />
                    <div>
                      <p className="text-xs font-bold text-txt-main">
                        Archivo PDF 2 cargado
                      </p>
                      <a
                        href={`${window.BACKEND_URL || "http://localhost:3000"}${formExistingPdf2}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-corpoelec-blue font-black uppercase tracking-wider hover:underline"
                      >
                        Ver archivo PDF actual
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormDeletePdf2(true)}
                    className="p-2 rounded-lg text-corpoelec-red hover:bg-corpoelec-red/10 transition-colors"
                    title="Remover PDF actual"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-main hover:border-corpoelec-blue/50 bg-bg-surface hover:bg-bg-main/30 rounded-xl cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormPdfFile2(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <FileUp
                      className="text-txt-muted group-hover:text-corpoelec-blue transition-colors mb-2"
                      size={24}
                    />
                    {formPdfFile2 ? (
                      <div className="text-center">
                        <span className="text-xs font-bold text-corpoelec-blue uppercase break-all block px-4">
                          {formPdfFile2.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormPdfFile2(null);
                          }}
                          className="text-[9px] font-black text-corpoelec-red uppercase block mx-auto mt-2 hover:underline tracking-wider"
                        >
                          Quitar archivo seleccionado
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs font-bold text-txt-main group-hover:text-corpoelec-blue transition-colors block">
                          SELECCIONAR ARCHIVO PDF DE INSPECCIÓN 2
                        </span>
                        <span className="text-[9px] text-txt-muted uppercase tracking-wider block mt-1">
                          Solo se permiten archivos PDF (Límite 20MB)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Notes / Observations */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                Observaciones y Notas (Opcional)
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={5}
                placeholder="REGISTRE AQUÍ LAS OBSERVACIONES O DETALLES DE LA INSPECCIÓN..."
                className="input-field py-3 text-xs font-bold leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              className="btn-primary h-11 px-8 shadow-xl shadow-corpoelec-blue/15"
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
        message={`¿Está seguro de que desea eliminar el registro de inspección "${itemToDelete?.code}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Registro"
        variant="danger"
      />
    </div>
  );
}
