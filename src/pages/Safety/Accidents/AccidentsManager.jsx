import { useState, useEffect } from "react";
import {
  Plus,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Loader2,
  User,
  Clock,
  LayoutGrid,
  List,
  Search,
  X,
  SlidersHorizontal,
  Archive,
  ArchiveRestore,
  Edit2,
  Eye,
} from "lucide-react";
import Modal from "../../../components/Modal";
import AccidentForm from "./AccidentForm";
import AccidentDetails from "./AccidentDetails";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";

export default function AccidentsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'grid' o 'table'
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedProcessStatus, setSelectedProcessStatus] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const api = helpFetch();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const fetchAccidents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accidents");
      if (res && !res.err) {
        const list = Array.isArray(res) ? res : [];
        setAccidents(list);
        const years = Array.from(
          new Set(list.map((a) => a.period?.annuality).filter(Boolean)),
        ).sort((a, b) => b - a);
        if (years.length > 0) {
          setSelectedYear((prev) =>
            prev && years.includes(prev) ? prev : years[0],
          );
        } else {
          setSelectedYear(new Date().getFullYear().toString());
        }
      }
    } catch (error) {
      showNotification("Error al cargar lista de accidentes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

  const uniqueYears = Array.from(
    new Set(accidents.map((a) => a.period?.annuality).filter(Boolean)),
  ).sort((a, b) => b - a);

  const handleSaveAccident = async (data) => {
    try {
      const res = await api.post("/accidents", { body: data });
      if (res && !res.err) {
        showNotification("Accidente registrado exitosamente", "success");
        setIsModalOpen(false);
        fetchAccidents();
      } else {
        showNotification(
          res.message || "Error al registrar accidente",
          "error",
        );
      }
    } catch (error) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleEdit = async (acc) => {
    if (!acc) return;
    try {
      // Cargamos los detalles completos antes de abrir el form de edición
      // para asegurar que tenemos testigos, documentos y empleados cargados
      const res = await api.get(`/accidents/${acc.id}`);
      if (res && !res.err) {
        setSelectedAccident(res);
        setIsModalOpen(true);
      } else {
        showNotification("Error al cargar detalles para edición", "error");
      }
    } catch (error) {
      showNotification("Error al conectar con el servidor", "error");
    }
  };

  const handleViewDetails = async (acc) => {
    if (!acc) return;
    setSelectedAccident(acc);
    setIsDetailModalOpen(true);

    try {
      const res = await api.get(`/accidents/${acc.id}`);
      if (res && !res.err) {
        setSelectedAccident(res);
      }
    } catch (error) {
      console.error("Error al cargar detalles profundos", error);
    }
  };

  // Extract unique items for select drop-downs dynamically
  const uniqueFacilities = Array.from(
    new Map(
      accidents
        .filter((a) => a.facility)
        .map((a) => [a.facility.id, a.facility]),
    ).values(),
  );

  const uniqueTypes = Array.from(
    new Map(
      accidents.filter((a) => a.type).map((a) => [a.type.id, a.type]),
    ).values(),
  );

  const uniqueProcessStatuses = Array.from(
    new Map(
      accidents
        .filter((a) => a.processStatus)
        .map((a) => [a.processStatus.id, a.processStatus]),
    ).values(),
  );

  const hasCustomLocations = accidents.some((a) => a.locationType === "custom");

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedFacility("");
    setSelectedType("");
    setSelectedProcessStatus("");
  };

  const filteredAccidents = accidents.filter((acc) => {
    if (selectedYear && String(acc.period?.annuality) !== String(selectedYear))
      return false;

    // Free text search in affected employee name, ID card, control number, description, custom location, facility name, parish, city, state, or type
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();

      // Check all involved employees
      const matchesEmployees = (acc.involvedEmployees || []).some((inv) => {
        if (!inv?.employee) return false;
        const fullName =
          `${inv.employee.firstName} ${inv.employee.lastName}`.toLowerCase();
        const idCard = (
          inv.employee.idCard ||
          inv.employee.id_card ||
          ""
        ).toLowerCase();
        const empMgt = (inv.employee.management?.name || "").toLowerCase();
        return (
          fullName.includes(term) ||
          idCard.includes(term) ||
          empMgt.includes(term)
        );
      });

      const controlNum = (acc.accidentControlNumber || "").toLowerCase();
      const fileNum = (acc.inpsaselFileNumber || "").toLowerCase();
      const desc = (acc.description || "").toLowerCase();
      const typeName = (acc.type?.name || "").toLowerCase();
      const customLoc = (acc.customAddressDetails || "").toLowerCase();
      const facilityName = (acc.facility?.name || "").toLowerCase();
      const parishName = (acc.parish?.name || "").toLowerCase();
      const cityName = (acc.parish?.city?.name || "").toLowerCase();
      const stateName = (acc.parish?.city?.state?.name || "").toLowerCase();
      const mgtName = (acc.management?.name || "").toLowerCase();

      const matches =
        matchesEmployees ||
        mgtName.includes(term) ||
        controlNum.includes(term) ||
        fileNum.includes(term) ||
        desc.includes(term) ||
        typeName.includes(term) ||
        customLoc.includes(term) ||
        facilityName.includes(term) ||
        parishName.includes(term) ||
        cityName.includes(term) ||
        stateName.includes(term) ||
        String(acc.id).includes(term);

      if (!matches) return false;
    }

    // Date range checks - safer check using YYYY-MM-DD substring
    const accDate = acc.accidentDate ? acc.accidentDate.substring(0, 10) : "";
    if (startDate && accDate < startDate) return false;
    if (endDate && accDate > endDate) return false;

    // Facility/location check
    if (selectedFacility) {
      if (selectedFacility === "custom") {
        if (acc.locationType !== "custom") return false;
      } else {
        if (String(acc.facilityId) !== String(selectedFacility)) return false;
      }
    }

    // Accident type check
    if (selectedType && String(acc.accidentTypeId) !== String(selectedType))
      return false;

    // Process status check
    if (
      selectedProcessStatus &&
      String(acc.processStatusId) !== String(selectedProcessStatus)
    )
      return false;

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tighter flex items-center gap-3">
            <AlertCircle size={24} className="text-corpoelec-blue shrink-0" />
            <span>Control de Accidentes</span>
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {uniqueYears.length === 0 ? (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted pb-1 border-b-2 border-transparent">
                Sin Registros
              </span>
            ) : (
              uniqueYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all cursor-pointer ${
                    String(selectedYear) === String(year)
                      ? "border-corpoelec-blue text-corpoelec-blue"
                      : "border-transparent text-txt-muted hover:text-txt-main"
                  }`}
                >
                  Año {year} (
                  {
                    accidents.filter(
                      (a) => String(a.period?.annuality) === String(year),
                    ).length
                  }
                  )
                </button>
              ))
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Selector de Vista */}
          <div className="flex bg-bg-main/50 p-1 rounded-xl border border-border-main/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-bg-surface text-corpoelec-blue shadow-sm" : "text-txt-muted"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-bg-surface text-corpoelec-blue shadow-sm" : "text-txt-muted"}`}
            >
              <List size={18} />
            </button>
          </div>
          {user?.role !== "Analista" && (
            <button
              className="btn-primary flex-1 sm:flex-none"
              onClick={() => {
                setSelectedAccident(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={20} />
              <span>Registrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      {!loading && accidents.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Campo de Búsqueda */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Buscar por afectado, código, descripción, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 h-12 w-full font-bold uppercase text-xs tracking-wider placeholder:text-txt-muted/30"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Botones de Control */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-12 px-6 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                  showAdvancedFilters
                    ? "bg-corpoelec-blue/10 border-corpoelec-blue text-corpoelec-blue shadow-lg shadow-corpoelec-blue/5"
                    : "bg-bg-surface border-border-main text-txt-muted hover:text-txt-main hover:bg-bg-main"
                }`}
              >
                <SlidersHorizontal size={16} />
                <span>Filtros Avanzados</span>
              </button>

              {(searchTerm ||
                startDate ||
                endDate ||
                selectedFacility ||
                selectedType ||
                selectedProcessStatus) && (
                <button
                  onClick={handleClearFilters}
                  className="h-12 px-5 rounded-xl border border-corpoelec-red/20 bg-corpoelec-red/10 text-corpoelec-red font-black text-xs uppercase tracking-wider hover:bg-corpoelec-red/20 transition-all active:scale-95 shrink-0"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Panel de Filtros Avanzados */}
          {showAdvancedFilters && (
            <div className="glass-panel p-6 rounded-[2rem] border border-border-main/40 bg-bg-surface/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-in slide-in-from-top duration-300">
              {/* Filtro de Fecha Desde */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Fecha Desde
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field h-11 text-xs"
                />
              </div>

              {/* Filtro de Fecha Hasta */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Fecha Hasta
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field h-11 text-xs"
                />
              </div>

              {/* Filtro de Sede / Lugar */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <MapPin size={12} /> Lugar / Sede
                </label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="input-field h-11 text-xs font-bold"
                >
                  <option value="">TODOS LOS LUGARES</option>
                  {uniqueFacilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name.toUpperCase()}
                    </option>
                  ))}
                  {hasCustomLocations && (
                    <option value="custom">
                      UBICACIÓN EXTERNA (FUERA DE SEDE)
                    </option>
                  )}
                </select>
              </div>

              {/* Filtro de Tipo de Accidente */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <AlertCircle size={12} /> Tipo de Accidente
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input-field h-11 text-xs font-bold"
                >
                  <option value="">TODOS LOS TIPOS</option>
                  {uniqueTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name.replace(/└─\s*/, "").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Estado del Trámite */}
              <div className="space-y-1 col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Clock size={12} /> Estado Trámite
                </label>
                <select
                  value={selectedProcessStatus}
                  onChange={(e) => setSelectedProcessStatus(e.target.value)}
                  className="input-field h-11 text-xs font-bold"
                >
                  <option value="">TODOS LOS ESTADOS</option>
                  {uniqueProcessStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 glass-panel rounded-3xl">
          <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
          <p className="text-txt-muted font-black tracking-widest uppercase text-[10px]">
            Consultando registros...
          </p>
        </div>
      ) : accidents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-border-main/50">
          <div className="h-20 w-20 bg-bg-main/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border-main">
            <Shield size={32} className="text-txt-muted/30" />
          </div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest">
            Sin Accidentes Registrados
          </h3>
          <p className="text-txt-muted mt-2 text-xs italic max-w-xs mx-auto">
            No se han encontrado reportes de investigación en el sistema.
          </p>
        </div>
      ) : filteredAccidents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-border-main/50">
          <div className="h-16 w-16 bg-bg-main/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border-main text-txt-muted/40">
            <Search size={28} />
          </div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest">
            Sin Resultados de Búsqueda
          </h3>
          <p className="text-txt-muted mt-2 text-xs italic max-w-xs mx-auto">
            Ningún accidente coincide con los filtros aplicados. Intente limpiar
            o ajustar sus filtros de búsqueda.
          </p>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredAccidents.map((acc) => (
                <div
                  key={acc.id}
                  className="glass-panel p-6 rounded-3xl border border-border-main/50 hover:border-corpoelec-blue/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-corpoelec-red/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-corpoelec-red/10 text-corpoelec-red rounded-2xl">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
                          ID #{acc.id}
                        </span>
                        <span className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                          Año: {acc.period?.annuality}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {user?.role !== "Analista" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(acc);
                          }}
                          className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(acc);
                        }}
                        className="p-2 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                      >
                        <Shield size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-bg-main text-txt-main rounded-full flex items-center justify-center border border-border-main">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">
                          Afectado:
                        </p>
                        <p className="text-sm font-bold text-txt-main">
                          {acc.involvedEmployees?.[0]?.employee
                            ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
                            : "No especificado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border-main/50">
                      <div className="flex flex-col gap-2">
                        <div
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                            acc.processStatusId === 3
                              ? "bg-green-500/10 text-green-500"
                              : acc.processStatusId === 2
                                ? "bg-corpoelec-blue/10 text-corpoelec-blue"
                                : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              acc.processStatusId === 3
                                ? "bg-green-500"
                                : acc.processStatusId === 2
                                  ? "bg-corpoelec-blue"
                                  : "bg-amber-500"
                            }`}
                          ></span>
                          {acc.processStatus?.name || "Pendiente"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-border-main/50 animate-in fade-in duration-500">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-main/30 border-b border-border-main">
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      ID
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Fecha
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Magnitud
                    </th>

                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Afectado
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Codigo
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest">
                      Tipo de Accidente
                    </th>
                    <th className="p-5 text-[10px] font-black text-txt-muted uppercase tracking-widest text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccidents.map((acc) => (
                    <tr
                      key={acc.id}
                      className="border-b border-border-main/50 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-5 text-xs font-bold text-txt-main">
                        #{acc.id}
                      </td>
                      <td className="p-5 text-xs font-bold text-txt-main">
                        {acc.accidentDate}
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-[12px] uppercase font-bold text-txt-main
                            }`}
                          >
                            {acc.magnitude?.name ||
                              acc.magnitude?.description ||
                              "No Especificada"}
                          </span>
                        </div>
                      </td>

                      <td className="p-5">
                        <span className="text-xs font-bold text-txt-main">
                          {acc.involvedEmployees?.[0]?.employee
                            ? `${acc.involvedEmployees[0].employee.firstName} ${acc.involvedEmployees[0].employee.lastName}`
                            : "---"}
                        </span>
                      </td>

                      <td className="p-5 ">
                        <span className="text-xs font-bold text-txt-main">
                          {acc.accidentControlNumber ||
                            acc.accident_control_number}
                        </span>
                      </td>
                      <td className="p-5 text-xs font-bold text-txt-main tracking-widest">
                        {acc.type?.name || "NO CLASIFICADO"}
                      </td>
                      <td className="p-5 text-center flex items-center justify-center gap-2">
                        {user?.role !== "Analista" && (
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-txt-muted hover:text-corpoelec-blue transition-all"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(acc)}
                          className="p-2 text-txt-muted hover:text-corpoelec-blue transition-all"
                          title="Detalles"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal de Registro / Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedAccident ? "Editar Investigación" : "Nueva Investigación"
        }
        maxWidth="max-w-4xl"
        closeOnOutsideClick={false}
      >
        <AccidentForm
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            if (selectedAccident) {
              try {
                const res = await api.put(`/accidents/${selectedAccident.id}`, {
                  body: data,
                });
                if (res && !res.err) {
                  showNotification(
                    "Investigación actualizada exitosamente",
                    "success",
                  );
                  setIsModalOpen(false);
                  fetchAccidents();
                } else {
                  showNotification(
                    res.message || "Error al actualizar",
                    "error",
                  );
                }
              } catch (e) {
                showNotification("Error de conexión", "error");
              }
            } else {
              await handleSaveAccident(data);
            }
          }}
          initialData={selectedAccident}
        />
      </Modal>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha Técnica de Investigación"
        maxWidth="max-w-5xl"
        closeOnOutsideClick={false}
      >
        <AccidentDetails accident={selectedAccident} />
      </Modal>
    </div>
  );
}

// Subcomponent used in the cards
function Shield({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
