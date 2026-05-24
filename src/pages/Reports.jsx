import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  FileText, 
  Download, 
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  Loader2,
  X
} from "lucide-react";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

export default function ReportCenter() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({
    payroll: false,
    accidents: false,
    inspections: false
  });
  const [stats, setStats] = useState({
    accidents: 0,
    employees: 0,
    users: 0,
    inspections: 0
  });

  // Custom Dynamic Report generator state
  const [customReportType, setCustomReportType] = useState("accidents");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedManagement, setSelectedManagement] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  const [accidentTypeId, setAccidentTypeId] = useState("");
  const [processStatusId, setProcessStatusId] = useState("");
  const [inspectionType, setInspectionType] = useState("");
  const [inspectionStatusId, setInspectionStatusId] = useState("");

  // Lookups lists
  const [managements, setManagements] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [accidentTypes, setAccidentTypes] = useState([]);
  const [inspectionStatuses, setInspectionStatuses] = useState([]);

  // Preview records
  const [previewRecords, setPreviewRecords] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [customDownloading, setCustomDownloading] = useState(false);

  const api = helpFetch();
  const { showNotification, clearNotifications } = useNotification();

  useEffect(() => {
    const fetchStatsAndLookups = async () => {
      setLoading(true);
      try {
        const [accRes, empRes, userRes, inspRes, mgtRes, facRes, accTypeRes, statusRes] = await Promise.all([
          api.get("/accidents"),
          api.get("/employees"),
          api.get("/users"),
          api.get("/inspections"),
          api.get("/lookups/managements"),
          api.get("/facilities"),
          api.get("/lookups/accident-types"),
          api.get("/lookups/inspection-status")
        ]);

        setStats({
          accidents: Array.isArray(accRes) ? accRes.length : 0,
          employees: Array.isArray(empRes) ? empRes.length : 0,
          users: Array.isArray(userRes) ? userRes.length : 0,
          inspections: Array.isArray(inspRes) ? inspRes.length : 0
        });

        if (Array.isArray(mgtRes)) setManagements(mgtRes);
        if (Array.isArray(facRes)) setFacilities(facRes);
        if (Array.isArray(accTypeRes)) setAccidentTypes(accTypeRes);
        if (Array.isArray(statusRes)) setInspectionStatuses(statusRes);
      } catch (error) {
        console.error("Error loading stats and lookups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndLookups();
  }, []);

  const handleDownload = async (type, endpoint, defaultName) => {
    setDownloading(prev => ({ ...prev, [type]: true }));
    try {
      showNotification("Generando y descargando PDF...", "info");
      await api.download(endpoint, defaultName);
      clearNotifications();
      showNotification("Reporte descargado con éxito", "success");
    } catch (error) {
      clearNotifications();
      showNotification("Error al generar el archivo PDF", "error");
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDownloadCustomReport = async () => {
    if (!previewRecords || previewRecords.length === 0) {
      showNotification("No hay registros en la vista previa para exportar.", "warning");
      return;
    }

    setCustomDownloading(true);
    try {
      showNotification("Generando reporte a tu medida...", "info");
      
      const idsParam = previewRecords.map(r => r.id).join(",");
      let queryParams = `?reportType=${customReportType}&ids=${idsParam}`;

      const filename = `reporte_personalizado_${customReportType}_${new Date().toISOString().split("T")[0]}.pdf`;
      await api.download(`/reports/custom${queryParams}`, filename);
      clearNotifications();
      showNotification("Reporte personalizado descargado", "success");
    } catch (error) {
      clearNotifications();
      showNotification("Error al generar el reporte a medida", "error");
    } finally {
      setCustomDownloading(false);
    }
  };

  const handleExcludeRecord = (id) => {
    setPreviewRecords(prev => prev.filter(rec => rec.id !== id));
    showNotification("Registro excluido de la exportación", "info");
  };

  const handleFetchPreview = async () => {
    setPreviewLoading(true);
    try {
      showNotification("Buscando registros coincidentes...", "info");
      
      let queryParams = `?reportType=${customReportType}&preview=true`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      if (customReportType === "accidents") {
        if (selectedManagement) queryParams += `&managementId=${selectedManagement}`;
        if (accidentTypeId) queryParams += `&accidentTypeId=${accidentTypeId}`;
        if (processStatusId) queryParams += `&processStatusId=${processStatusId}`;
      } else {
        if (selectedFacility) queryParams += `&facilityId=${selectedFacility}`;
        if (inspectionType) queryParams += `&inspectionType=${inspectionType}`;
        if (inspectionStatusId) queryParams += `&statusId=${inspectionStatusId}`;
      }

      const res = await api.get(`/reports/custom${queryParams}`);
      clearNotifications();
      if (res && !res.err) {
        setPreviewRecords(res);
        showNotification(`Búsqueda finalizada. ${res.length} registros encontrados.`, "success");
      } else {
        setPreviewRecords([]);
        showNotification("No se encontraron registros coincidentes.", "warning");
      }
    } catch (error) {
      clearNotifications();
      showNotification("Error al previsualizar registros", "error");
      setPreviewRecords([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
             <BarChart3 className="text-corpoelec-blue" size={28} />
             Centro de Reportes y Estadísticas
          </h2>
          <p className="text-txt-muted mt-1 text-[11px] font-medium uppercase tracking-widest">Análisis de indicadores ASHO y gestión operativa.</p>
        </div>
        <div className="flex gap-3">
           <button className="btn-secondary h-12">
             <Calendar size={18} />
             <span>Últimos 30 días</span>
           </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Accidentes Registrados", value: stats.accidents, icon: ShieldAlert, color: "text-corpoelec-red", bg: "bg-corpoelec-red/10" },
          { label: "Personal Activo", value: stats.employees, icon: Users, color: "text-corpoelec-blue", bg: "bg-corpoelec-blue/10" },
          { label: "Usuarios Sistema", value: stats.users, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Inspecciones Realizadas", value: stats.inspections, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-[2rem] border border-border-main/50 space-y-4 relative overflow-hidden group">
            <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} w-fit shadow-inner`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              {loading ? (
                <Loader2 size={24} className="animate-spin text-txt-muted/50" />
              ) : (
                <p className="text-3xl font-black text-txt-main tracking-tighter tabular-nums">{kpi.value.toLocaleString()}</p>
              )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Charts (Visual Mockups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Mockup */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-corpoelec-blue" />
              Tendencia de Incidentes
            </h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-corpoelec-blue shadow-[0_0_10px_rgba(0,92,158,0.5)]" />
              <span className="w-3 h-3 rounded-full bg-corpoelec-red shadow-[0_0_10px_rgba(227,6,19,0.5)]" />
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-2 pt-10">
             {[45, 78, 52, 91, 63, 84, 55, 67, 88, 42, 60, 75].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                 <div className="w-full bg-corpoelec-blue/10 rounded-full h-full relative overflow-hidden flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-corpoelec-blue/80 to-corpoelec-blue rounded-full transition-all duration-1000 group-hover:brightness-125"
                      style={{ height: `${val}%` }}
                    />
                 </div>
                 <span className="text-[9px] font-black text-txt-muted uppercase opacity-40">{['E','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                 <div className="absolute -top-6 bg-txt-main text-bg-main px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {val}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Distribution Mockup */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
           <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon size={16} className="text-corpoelec-blue" />
              Distribución por Severidad
            </h3>
            
            <div className="flex items-center justify-around h-64 relative">
               <div className="relative w-48 h-48">
                  {/* Mock Pie CSS-only segments */}
                  <div className="absolute inset-0 rounded-full border-[20px] border-emerald-500 border-l-transparent border-b-transparent rotate-45" />
                  <div className="absolute inset-0 rounded-full border-[20px] border-amber-500 border-t-transparent border-r-transparent -rotate-12" />
                  <div className="absolute inset-0 rounded-full border-[20px] border-corpoelec-red border-t-transparent border-r-transparent rotate-[60deg]" />
                  <div className="absolute inset-4 rounded-full bg-bg-surface flex flex-col items-center justify-center border border-border-main/50">
                    <p className="text-2xl font-black text-txt-main">100%</p>
                    <p className="text-[8px] font-black text-txt-muted uppercase tracking-[0.2em]">Analizado</p>
                  </div>
               </div>

               <div className="space-y-4 w-40">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Bajo Riesgo</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">65% Incidencias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Moderado</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">25% Incidencias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-corpoelec-red" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-txt-main uppercase leading-none">Crítico</p>
                      <p className="text-[9px] text-txt-muted font-bold mt-0.5">10% Incidencias</p>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* PDF Export Section */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6">
        <div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
            <Download size={18} className="text-corpoelec-blue" />
            Descarga de Reportes y Documentación Oficial (PDF)
          </h3>
          <p className="text-txt-muted mt-1 text-[10px] uppercase font-bold tracking-wider">Generación de archivos certificados por el departamento de ASHO.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Payroll PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-corpoelec-blue/40 transition-all group">
            <div className="space-y-2">
              <div className="p-3 bg-corpoelec-blue/10 text-corpoelec-blue rounded-2xl w-fit">
                <Users size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">Roster / Nómina de Personal</h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Listado oficial completo de todo el personal activo en el sistema, detallando cargo, gerencia y cédula de identidad.
              </p>
            </div>
            <button 
              disabled={downloading.payroll}
              onClick={() => handleDownload("payroll", "/reports/payroll", "nomina_personal.pdf")}
              className="btn-primary w-full h-11 text-xs justify-center gap-2"
            >
              {downloading.payroll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Nómina</span>
            </button>
          </div>

          {/* Accidents List PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-corpoelec-red/40 transition-all group">
            <div className="space-y-2">
              <div className="p-3 bg-corpoelec-red/10 text-corpoelec-red rounded-2xl w-fit">
                <ShieldAlert size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">Histórico de Accidentes</h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Reporte consolidado del listado general de todos los accidentes e incidentes registrados, con fecha, tipo y estatus del caso.
              </p>
            </div>
            <button 
              disabled={downloading.accidents}
              onClick={() => handleDownload("accidents", "/reports/accidents", "listado_accidentes.pdf")}
              className="btn-primary w-full h-11 text-xs justify-center gap-2 !bg-corpoelec-red hover:!bg-corpoelec-red/90"
            >
              {downloading.accidents ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Accidentes</span>
            </button>
          </div>

          {/* Inspections List PDF */}
          <div className="bg-bg-main/30 p-6 rounded-3xl border border-border-main/30 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="space-y-2">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit">
                <FileText size={22} />
              </div>
              <h4 className="font-black text-txt-main text-xs uppercase tracking-wider">Histórico de Inspecciones</h4>
              <p className="text-[10px] text-txt-muted font-semibold leading-relaxed uppercase">
                Compendio completo de todas las inspecciones de seguridad realizadas (generales, extintores y vehicular).
              </p>
            </div>
            <button 
              disabled={downloading.inspections}
              onClick={() => handleDownload("inspections", "/reports/inspections", "listado_inspecciones.pdf")}
              className="btn-primary w-full h-11 text-xs justify-center gap-2 !bg-amber-500 hover:!bg-amber-600"
            >
              {downloading.inspections ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Descargar Inspecciones</span>
            </button>
          </div>

        </div>
      </div>

      {/* Generador Personalizado de Reportes PDF (Filtros Dinámicos & Live Preview) */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-border-main/50 space-y-6 animate-in fade-in duration-500">
        <div>
          <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2">
            <Filter size={18} className="text-corpoelec-blue" />
            Generador de Reportes Personalizados (Búsqueda Avanzada)
          </h3>
          <p className="text-txt-muted mt-1 text-[10px] uppercase font-bold tracking-wider">
            Filtra información por cualquier criterio, previsualiza los resultados en vivo y descarga el documento oficial PDF personalizado.
          </p>
        </div>

        {/* Filters Grid */}
        <div className="bg-bg-main/20 p-6 rounded-3xl border border-border-main/40 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Tipo de Reporte */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Módulo de Búsqueda</label>
              <select
                value={customReportType}
                onChange={(e) => {
                  setCustomReportType(e.target.value);
                  setSelectedManagement("");
                  setSelectedFacility("");
                  setAccidentTypeId("");
                  setProcessStatusId("");
                  setInspectionType("");
                  setInspectionStatusId("");
                  setPreviewRecords(null);
                }}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              >
                <option value="accidents">INVESTIGACIÓN DE ACCIDENTES</option>
                <option value="inspections">INSPECCIONES Y AUDITORÍAS</option>
              </select>
            </div>

            {/* 2. Fecha de Inicio */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Fecha Desde (Inicio)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              />
            </div>

            {/* 3. Fecha de Fin */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Fecha Hasta (Fin)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
              />
            </div>
          </div>

          <div className="border-t border-border-main/20 pt-4">
            <span className="text-[8px] font-black text-corpoelec-blue uppercase tracking-widest block mb-4">Criterios de Investigación Específica</span>
            
            {customReportType === "accidents" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* A1. Gerencia */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Gerencia Responsable</label>
                  <select
                    value={selectedManagement}
                    onChange={(e) => setSelectedManagement(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS GERENCIAS</option>
                    {managements.map((mgt) => (
                      <option key={mgt.id} value={mgt.id}>
                        {mgt.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* A2. Tipo de Accidente */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Tipo de Lesión/Incidente</label>
                  <select
                    value={accidentTypeId}
                    onChange={(e) => setAccidentTypeId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS TIPOS</option>
                    {accidentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* A3. Estatus de Proceso */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Estado del Proceso</label>
                  <select
                    value={processStatusId}
                    onChange={(e) => setProcessStatusId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS ESTADOS</option>
                    {inspectionStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* I1. Sede */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Sede o Centro de Trabajo</label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS SEDES</option>
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* I2. Tipo de Inspección */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Tipo de Inspección</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODAS LAS PLANILLAS</option>
                    <option value="extinguishers">INSPECCIÓN DE EXTINTORES</option>
                    <option value="vehicles">INSPECCIÓN VEHICULAR (FLOTA)</option>
                    <option value="protection">EQUIPOS DE PROTECCIÓN (EPI)</option>
                  </select>
                </div>

                {/* I3. Estado Inspección */}
                <div className="flex flex-col space-y-2">
                  <label className="text-[9px] font-black uppercase text-txt-muted tracking-wider">Estado de Evaluación</label>
                  <select
                    value={inspectionStatusId}
                    onChange={(e) => setInspectionStatusId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-main rounded-xl px-3 py-2.5 text-xs font-semibold text-txt-main focus:outline-none focus:border-corpoelec-blue"
                  >
                    <option value="">TODOS LOS ESTADOS</option>
                    {inspectionStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-4 border-b border-border-main/30 pb-4">
          <div>
            {previewRecords !== null && (
              <span className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest bg-corpoelec-blue/10 px-4 py-2 rounded-xl border border-corpoelec-blue/20">
                Coincidencias encontradas: {previewRecords.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              disabled={previewLoading}
              onClick={handleFetchPreview}
              className="btn-secondary h-11 text-[10px] font-black uppercase tracking-widest gap-2"
            >
              {previewLoading ? (
                <Loader2 size={14} className="animate-spin text-corpoelec-blue" />
              ) : (
                <Filter size={14} />
              )}
              <span>Buscar y Previsualizar</span>
            </button>

            {/* Download PDF Button */}
            <button
              disabled={customDownloading || !previewRecords || previewRecords.length === 0}
              onClick={handleDownloadCustomReport}
              className="btn-primary h-11 text-[10px] font-black uppercase tracking-widest gap-2 bg-corpoelec-blue hover:bg-corpoelec-blue/90 px-5 rounded-xl text-white transition-all flex items-center shadow-md disabled:opacity-30 disabled:pointer-events-none"
            >
              {customDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* live PREVIEW AREA */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest block">
            Vista Previa de Registros a Exportar
          </span>

          {previewLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-bg-main/10 rounded-3xl border border-border-main/30">
              <Loader2 size={36} className="text-corpoelec-blue animate-spin" />
              <p className="text-[10px] font-black uppercase text-txt-muted tracking-[0.2em]">Escaneando base de datos...</p>
            </div>
          ) : previewRecords === null ? (
            <div className="text-center py-14 bg-bg-main/5 border border-border-main/30 rounded-3xl text-txt-muted text-xs italic">
              Aplica los filtros deseados y presiona "Buscar y Previsualizar" para revisar los registros antes de exportar el PDF.
            </div>
          ) : previewRecords.length === 0 ? (
            <div className="text-center py-14 bg-bg-main/5 border border-border-main/30 rounded-3xl text-corpoelec-red font-black text-[10px] uppercase tracking-widest">
              No se encontraron registros que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem] shadow-sm">
              <div className="overflow-x-auto no-scrollbar max-h-[40vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-bg-surface border-b border-border-main shadow-sm">
                    {customReportType === "accidents" ? (
                      <tr className="bg-bg-main/20 text-[9px] uppercase font-black text-txt-muted tracking-widest border-b border-border-main">
                        <th className="px-5 py-3">Nro de Caso</th>
                        <th className="px-5 py-3">Fecha del Accidente</th>
                        <th className="px-5 py-3">Tipo de Lesión</th>
                        <th className="px-5 py-3">Gerencia Responsable</th>
                        <th className="px-5 py-3">Instalación</th>
                        <th className="px-5 py-3">Estatus</th>
                        <th className="px-5 py-3 text-center">Excluir</th>
                      </tr>
                    ) : (
                      <tr className="bg-bg-main/20 text-[9px] uppercase font-black text-txt-muted tracking-widest border-b border-border-main">
                        <th className="px-5 py-3">Código</th>
                        <th className="px-5 py-3">Fecha Auditoría</th>
                        <th className="px-5 py-3">Sede Evaluada</th>
                        <th className="px-5 py-3">Inspector a Cargo</th>
                        <th className="px-5 py-3">Tipo Inspección</th>
                        <th className="px-5 py-3">Estatus</th>
                        <th className="px-5 py-3 text-center">Excluir</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-border-main/20 text-xs text-txt-sub">
                    {customReportType === "accidents"
                      ? previewRecords.map((acc, index) => (
                          <tr key={acc.id} className="hover:bg-bg-main/10 transition-colors">
                            <td className="px-5 py-3.5 font-bold font-mono text-corpoelec-blue">
                              {acc.inpsaselFileNumber || `ACC-${String(acc.id).padStart(4, "0")}`}
                            </td>
                            <td className="px-5 py-3.5 font-semibold">
                              {acc.accidentDate ? new Date(acc.accidentDate).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-txt-main uppercase">
                              {acc.type?.name || "General"}
                            </td>
                            <td className="px-5 py-3.5 font-semibold uppercase">
                              {acc.management?.name || "-"}
                            </td>
                            <td className="px-5 py-3.5 font-semibold uppercase text-txt-muted">
                              {acc.facility?.name || "-"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-corpoelec-red/10 text-corpoelec-red border border-corpoelec-red/20 uppercase tracking-tighter">
                                {acc.processStatus?.name || "REGISTRADO"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => handleExcludeRecord(acc.id)}
                                className="p-1.5 hover:bg-corpoelec-red/10 text-corpoelec-red rounded-lg transition-colors inline-flex items-center justify-center border border-transparent hover:border-corpoelec-red/20"
                                title="Excluir de este reporte"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      : previewRecords.map((insp, index) => {
                          let typeStr = "General";
                          if (insp.extinguisherInspection) typeStr = "Extintores";
                          else if (insp.vehicleInspection) typeStr = "Vehicular";
                          else if (insp.protectionInspection) typeStr = "Protección EPI";

                          return (
                            <tr key={insp.id} className="hover:bg-bg-main/10 transition-colors">
                              <td className="px-5 py-3.5 font-bold font-mono text-corpoelec-blue">
                                {insp.inspectionNumber || `INSP-${String(insp.id).padStart(4, "0")}`}
                              </td>
                              <td className="px-5 py-3.5 font-semibold">
                                {insp.date ? new Date(insp.date).toLocaleDateString() : "-"}
                              </td>
                              <td className="px-5 py-3.5 font-bold text-txt-main uppercase">
                                {insp.facility?.name || "-"}
                              </td>
                              <td className="px-5 py-3.5 font-semibold uppercase">
                                {insp.inspector ? `${insp.inspector.lastName}, ${insp.inspector.firstName}` : "-"}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/20 uppercase">
                                  {typeStr}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  insp.statusId === 3 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                  insp.statusId === 2 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                  "bg-txt-muted/10 text-txt-muted border border-border-main"
                                }`}>
                                  {insp.status?.name || "EN PROCESO"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => handleExcludeRecord(insp.id)}
                                  className="p-1.5 hover:bg-corpoelec-red/10 text-corpoelec-red rounded-lg transition-colors inline-flex items-center justify-center border border-transparent hover:border-corpoelec-red/20"
                                  title="Excluir de este reporte"
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
