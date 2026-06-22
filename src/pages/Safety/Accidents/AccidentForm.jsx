import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Info,
  Users,
  FileText,
  Plus,
  Map as MapIcon,
  Home,
  Stethoscope,
  UserPlus,
  Trash2,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  Briefcase,
  User,
} from "lucide-react";
import GeographicCascade from "../../../components/GeographicCascade";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

import {
  ACCIDENT_HIERARCHY,
  HAZARD_HIERARCHY,
  CONTACT_EXPOSURE_HIERARCHY,
  AFFECTATION_CLASS_HIERARCHY,
  AFFECTATION_SUBJECT_HIERARCHY,
} from "./accidentHierarchies";

const AREA_AFFECTED_OPTIONS = [
  { value: "1", label: "1. Cabeza / cara" },
  { value: "2", label: "2. Cuello (incluye la garganta)" },
  { value: "3", label: "3. Tronco" },
  {
    value: "4",
    label:
      "4. Espalda (incluye la columna vertebral, médula espinal y músculos adyacentes)",
  },
  { value: "5", label: "5. Extremidades Superiores" },
  { value: "6", label: "6. Extremidades Inferiores" },
  { value: "7", label: "7. Ubicaciones múltiples" },
  { value: "8", label: "8. Lesiones generales (Sistemas Orgánicos)" },
  {
    value: "9",
    label: "9. Partes del Cuerpo No Clasificadas Bajo Otro Epígrafe",
  },
  { value: "10", label: "10. Ubicaciones no especificadas" },
];

const INJURY_NATURE_OPTIONS = [
  { value: "1", label: "1. Ahogamiento y asfixia" },
  { value: "2", label: "2. Amputación y Enucleaciones" },
  { value: "3", label: "3. Contusiones y aplastamientos" },
  { value: "4", label: "4. Efectos de la Presión Atmosférica" },
  { value: "5", label: "5. Efectos de Otras Causas Externas" },
  {
    value: "6",
    label: "6. Efectos de un cuerpo extraño que entre por orificio",
  },
  { value: "7", label: "7. Efectos del calor" },
  { value: "8", label: "8. Efectos del contacto eléctrico" },
  { value: "9", label: "9. Efectos del frío" },
  { value: "10", label: "10. Efectos del ruido y vibración" },
  {
    value: "11",
    label:
      "11. Efectos Nocivos de las Radiaciones (Excluye el Eritema Solar y las Quemaduras Debidas a Radiaciones Solares)",
  },
  {
    value: "12",
    label:
      "12. Efectos tóxicos o infecciones de sustancias de procedencia no medicinal o agentes biológicos.",
  },
  {
    value: "13",
    label:
      "13. Envenenamiento por drogas, medicamentos y productos (excluye los abusos de drogas sin dependencia, la dependencia de las drogas, ingestión o inhalación de sustancias tóxicas, corrosivas o cáusticas, las mordeduras de animales venonosos, las quemaduras químicas)",
  },
  { value: "14", label: "14. Esguinces, Torceduras" },
  { value: "15", label: "15. Fracturas" },
  {
    value: "16",
    label:
      "16. Heridas (Excluye las heridas punzantes con daño a órganos internos)",
  },
  { value: "17", label: "17. Hernia" },
  { value: "18", label: "18. Lesiones Internas del Tórax, Abdomen y Pelvis" },
  { value: "19", label: "19. Lesiones múltiples de naturaleza diferente" },
  { value: "20", label: "20. Luxaciones" },
  { value: "21", label: "21. Otros efectos adversos no clasificados" },
  { value: "22", label: "22. Quemaduras (Excluye traumatismos superficiales)" },
  {
    value: "23",
    label:
      "23. Reacciones alérgicas agudas causadas por un agente del medio de trabajo.",
  },
  { value: "24", label: "24. Tipo de lesión desconocida o sin especificar" },
  { value: "25", label: "25. Trauma psíquico, choque traumático" },
  {
    value: "26",
    label:
      "26. Traumatismo de los Nervios y de la Médula Espinal (Excluye las lesiones de los nervios complicadas con fracturas y otras lesiones óseas)",
  },
  { value: "27", label: "27. Traumatismo intracraneal" },
  { value: "28", label: "28. Traumatismos superficiales." },
];

const INJURY_LEVEL_OPTIONS = [
  { value: "0", label: "0 - Sin lesión" },
  { value: "1", label: "1 - Leve" },
  { value: "2", label: "2 - Moderada" },
  { value: "3", label: "3 - Grave" },
  { value: "3_muy_grave", label: "3 - Muy Grave" },
  { value: "4", label: "4 - Mortal" },
];

const INJURY_CONSEQUENCE_OPTIONS = [
  { value: "0", label: "0 - Lesión sin discapacidad" },
  { value: "1", label: "1 - Lesión con discapacidad parcial permanente" },
  {
    value: "2",
    label:
      "2 - Lesión con discapacidad total permanente para cualquier tipo de actividad",
  },
  { value: "3", label: "3 - Lesión con gran discapacidad" },
  { value: "4", label: "4 - Muerte" },
];

export default function AccidentForm({ onCancel, onSubmit, initialData }) {
  const [activeTab, setActiveTab] = useState("general");
  const [locationType, setLocationType] = useState("facility");
  const [loading, setLoading] = useState(true);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [showEmployeeCard, setShowEmployeeCard] = useState(null);

  const api = helpFetch();
  const { showNotification } = useNotification();
  useEffect(() => {
    if (initialData) {
      console.log("Datos iniciales recibidos del servidor:", initialData);
      setIsEditing(true);
      setFormData((prev) => {
        const sanitizedData = { ...prev };
        Object.keys(prev).forEach((key) => {
          if (initialData[key] !== undefined && initialData[key] !== null) {
            sanitizedData[key] = initialData[key];
          } else if (prev[key] === "" || prev[key] === null) {
            sanitizedData[key] = ""; // Mantener como string vacío si es null/undefined
          }
        });

        return {
          ...sanitizedData,
          processStatusId: 2, // Se fuerza a "En Proceso" al abrir el formulario (edición o creación)
          // Asegurar mapeo de campos específicos desde el backend (compatibilidad snake_case)
          accidentControlNumber:
            initialData.accidentControlNumber ||
            initialData.accident_control_number ||
            "",
          accidentNature: (() => {
            if (initialData.accidentNature || initialData.accident_nature) {
              return initialData.accidentNature || initialData.accident_nature;
            }
            // Intentar extraer la naturaleza del código de control (última letra)
            const controlNumber =
              initialData.accidentControlNumber ||
              initialData.accident_control_number;
            if (controlNumber && controlNumber.includes("-")) {
              const parts = controlNumber.split("-");
              if (parts.length === 4) return parts[3];
            }
            return "";
          })(),
          regionPrefix:
            initialData.regionPrefix || initialData.region_prefix || "32",
          affectedPersonnel:
            initialData.involvedEmployees
              ?.map((inv) => {
                if (!inv.employee) return null;
                return {
                  ...inv.employee,
                  injuryTypeId: inv.injuryTypeId || "",
                  magnitudeId: inv.magnitudeId || "",
                  restDays: inv.restDays || 0,
                  affectedArea: inv.affectedArea || "",
                  injuryNature: inv.injuryNature || "",
                  injuryLevel: inv.injuryLevel || "",
                  injuryConsequence: inv.injuryConsequence || "",
                };
              })
              .filter(Boolean) || [],
          documentsCheck:
            initialData.documentsCheck?.map(
              (doc) => doc.documentId || doc.document_id,
            ) || [],
        };
      });
      setLocationType(initialData.facilityId ? "facility" : "custom");
      if (initialData.witnesses)
        setWitnesses(
          initialData.witnesses.map((w) => ({
            name: w.name || "",
            idCard: w.idCard || "",
            phone: w.phone || "",
          })),
        );

      if (initialData.parish) {
        setIncidentLocation({
          stateId: initialData.parish.city?.stateId || "",
          cityId: initialData.parish.cityId || "",
          parish: initialData.parishId || "",
        });
      }

      if (initialData.medicalCenter && initialData.medicalCenter.parish) {
        setMedicalLocation({
          stateId: initialData.medicalCenter.parish.city?.stateId || "",
          cityId: initialData.medicalCenter.parish.cityId || "",
          parish: initialData.medicalCenter.parishId || "",
        });
      }
    }
  }, [initialData]);

  const [catalogs, setCatalogs] = useState({
    facilities: [],
    accidentTypes: [],
    damageAgents: [],
    contactTypes: [],
    periods: [],
    employees: [],
    inspectionStatuses: [],
    managements: [],
    medicalCenters: [],
    fileDocuments: [],
    injuryTypes: [],
    magnitudes: [],
  });

  const [formData, setFormData] = useState({
    accidentDate: "",
    accidentTime: "",
    description: "",
    managementId: "",
    inpsaselFileNumber: "",
    facilityId: "",
    accidentTypeId: "",
    periodId: "",
    magnitudeId: "",
    processStatusId: 2,
    damageAgentId: "",
    contactTypeId: "",
    customAddressDetails: "",
    activity: "",
    medicalCenterId: "",
    medicalCenterName: "",
    medicalCenterAddress: "",
    medicalObservations: "",
    globalObservations: "",
    affectedPersonnel: [],
    documentsCheck: [],
    workType: "",
    hazardCode: "",
    regionPrefix: "32",
    accidentControlNumber: "",
    accidentNature: "",
    contactExposureCode: "",
    affectationClassCode: "",
    affectationSubjectCode: "",
    assetsProcessAffectation: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  const [witnesses, setWitnesses] = useState([]);
  const [incidentLocation, setIncidentLocation] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });
  const [medicalLocation, setMedicalLocation] = useState({
    stateId: "",
    cityId: "",
    parish: "",
  });

  const [errors, setErrors] = useState({});

  const [selectedAccidentPath, setSelectedAccidentPath] = useState([]);
  const [selectedHazardPath, setSelectedHazardPath] = useState([]);
  const [selectedContactExposurePath, setSelectedContactExposurePath] =
    useState([]);
  const [selectedAffectationClassPath, setSelectedAffectationClassPath] =
    useState([]);
  const [selectedAffectationSubjectPath, setSelectedAffectationSubjectPath] =
    useState([]);
  const [selectedParentDamageAgent, setSelectedParentDamageAgent] =
    useState("");
  const [selectedParentContactType, setSelectedParentContactType] =
    useState("");

  // Resolving parent and sub-parent IDs on editing
  useEffect(() => {
    if (initialData) {
      if (catalogs.accidentTypes.length > 0) {
        const typeId = Number(initialData.accidentTypeId);
        if (typeId) {
          const dbRecord = catalogs.accidentTypes.find((t) => t.id === typeId);
          if (dbRecord && dbRecord.code) {
            const targetCode = dbRecord.code;

            const findPath = (nodes, code, currentPath = []) => {
              for (const node of nodes) {
                if (node.code === code) {
                  return [...currentPath, node.code];
                }
                if (node.children) {
                  const path = findPath(node.children, code, [
                    ...currentPath,
                    node.code,
                  ]);
                  if (path) return path;
                }
              }
              return null;
            };

            const path = findPath(ACCIDENT_HIERARCHY, targetCode);
            if (path) {
              setSelectedAccidentPath(path);
            }
          }
        }
      }
      if (initialData.hazardCode) {
        const findPath = (nodes, code, currentPath = []) => {
          for (const node of nodes) {
            if (node.code === code) {
              return [...currentPath, node.code];
            }
            if (node.children) {
              const path = findPath(node.children, code, [
                ...currentPath,
                node.code,
              ]);
              if (path) return path;
            }
          }
          return null;
        };

        const path = findPath(HAZARD_HIERARCHY, initialData.hazardCode);
        if (path) {
          setSelectedHazardPath(path);
        }
      }
      if (initialData.contactExposureCode) {
        const findPath = (nodes, code, currentPath = []) => {
          for (const node of nodes) {
            if (node.code === code) {
              return [...currentPath, node.code];
            }
            if (node.children) {
              const path = findPath(node.children, code, [
                ...currentPath,
                node.code,
              ]);
              if (path) return path;
            }
          }
          return null;
        };

        const path = findPath(
          CONTACT_EXPOSURE_HIERARCHY,
          initialData.contactExposureCode,
        );
        if (path) {
          setSelectedContactExposurePath(path);
        }
      }
      if (initialData.affectationClassCode) {
        const findPath = (nodes, code, currentPath = []) => {
          for (const node of nodes) {
            if (node.code === code) {
              return [...currentPath, node.code];
            }
            if (node.children) {
              const path = findPath(node.children, code, [
                ...currentPath,
                node.code,
              ]);
              if (path) return path;
            }
          }
          return null;
        };

        const path = findPath(
          AFFECTATION_CLASS_HIERARCHY,
          initialData.affectationClassCode,
        );
        if (path) {
          setSelectedAffectationClassPath(path);
        }
      }
      if (initialData.affectationSubjectCode) {
        const findPath = (nodes, code, currentPath = []) => {
          for (const node of nodes) {
            if (node.code === code) {
              return [...currentPath, node.code];
            }
            if (node.children) {
              const path = findPath(node.children, code, [
                ...currentPath,
                node.code,
              ]);
              if (path) return path;
            }
          }
          return null;
        };

        const path = findPath(
          AFFECTATION_SUBJECT_HIERARCHY,
          initialData.affectationSubjectCode,
        );
        if (path) {
          setSelectedAffectationSubjectPath(path);
        }
      }
      if (catalogs.damageAgents.length > 0) {
        const agentId = initialData.damageAgentId;
        if (agentId) {
          const parent = catalogs.damageAgents.find(
            (a) => a.id === Number(agentId),
          );
          if (parent) {
            setSelectedParentDamageAgent(agentId);
          } else {
            for (const p of catalogs.damageAgents) {
              if (
                p.children &&
                p.children.some((c) => c.id === Number(agentId))
              ) {
                setSelectedParentDamageAgent(p.id);
                break;
              }
            }
          }
        }
      }
      if (catalogs.contactTypes.length > 0) {
        const contactId = initialData.contactTypeId;
        if (contactId) {
          const parent = catalogs.contactTypes.find(
            (c) => c.id === Number(contactId),
          );
          if (parent) {
            setSelectedParentContactType(contactId);
          } else {
            for (const p of catalogs.contactTypes) {
              if (
                p.children &&
                p.children.some((c) => c.id === Number(contactId))
              ) {
                setSelectedParentContactType(p.id);
                break;
              }
            }
          }
        }
      }
    }
  }, [
    initialData,
    catalogs.accidentTypes,
    catalogs.damageAgents,
    catalogs.contactTypes,
  ]);

  // Sincronizar automáticamente la gerencia responsable con el primer trabajador afectado vinculado
  useEffect(() => {
    if (formData.affectedPersonnel && formData.affectedPersonnel.length > 0) {
      const firstEmp = formData.affectedPersonnel[0];
      const targetManagementId =
        firstEmp.managementId || firstEmp.management?.id || "";
      if (targetManagementId) {
        setFormData((prev) => {
          if (prev.managementId === targetManagementId) return prev;
          return {
            ...prev,
            managementId: targetManagementId,
          };
        });
      }
    } else {
      setFormData((prev) => {
        if (prev.managementId === "") return prev;
        return {
          ...prev,
          managementId: "",
        };
      });
    }
  }, [formData.affectedPersonnel]);

  // Auto-seleccionar el período/año basándose en la fecha del accidente
  useEffect(() => {
    if (
      formData.accidentDate &&
      catalogs.periods &&
      catalogs.periods.length > 0
    ) {
      const dateParts = formData.accidentDate.split("-");
      if (dateParts.length > 0) {
        const year = parseInt(dateParts[0], 10);
        if (!isNaN(year)) {
          const matchingPeriod = catalogs.periods.find(
            (p) => parseInt(p.annuality) === year,
          );
          if (matchingPeriod) {
            setFormData((prev) => {
              if (Number(prev.periodId) === Number(matchingPeriod.id))
                return prev;
              return {
                ...prev,
                periodId: matchingPeriod.id,
              };
            });
            if (errors.periodId) {
              setErrors((prev) => ({ ...prev, periodId: null }));
            }
          } else {
            // Si el año de la fecha no existe en los períodos de la base de datos,
            // limpiamos la selección para alertar al usuario y que seleccione/cree uno válido
            setFormData((prev) => {
              if (prev.periodId === "") return prev;
              return {
                ...prev,
                periodId: "",
              };
            });
          }
        }
      }
    }
  }, [formData.accidentDate, catalogs.periods, errors.periodId]);

  // Lógica para generar el Número de Control de Accidente
  useEffect(() => {
    const generateControlNumber = async () => {
      if (isManuallyEdited) {
        return;
      }
      if (!formData.accidentDate || !formData.accidentNature) {
        console.log("Esperando fecha y naturaleza para generar código...");
        return;
      }

      // Si ya tenemos un número de control (cargado de initialData),
      // verificamos si los componentes actuales coinciden para no sobrescribirlo
      const currentParts = formData.accidentControlNumber
        ? formData.accidentControlNumber.split("-")
        : [];
      const currentYear = formData.accidentDate.split("-")[0].slice(-2);

      // IMPORTANTE: Si ya existe un código y sus partes (Región, Año, Naturaleza) coinciden,
      // significa que ya está cargado correctamente. NO regeneramos para no perder el correlativo.
      if (
        currentParts.length === 4 &&
        currentParts[0] === formData.regionPrefix &&
        currentParts[1] === currentYear &&
        currentParts[3] === formData.accidentNature
      ) {
        console.log(
          "El código actual es válido, manteniendo correlativo:",
          currentParts[2],
        );
        return;
      }

      // 1. Prefijo de Región (Editable)
      const prefix = formData.regionPrefix || "32";

      // 2. Últimos dos dígitos del año
      const yearSuffix = formData.accidentDate.split("-")[0].slice(-2);

      // 3. Código de Naturaleza
      const natureCode = formData.accidentNature;

      // 4. Correlativo
      let correlative = "001";

      // Si estamos editando, intentamos preservar el correlativo original si existe
      if (
        formData.accidentControlNumber &&
        formData.accidentControlNumber.includes("-")
      ) {
        const parts = formData.accidentControlNumber.split("-");
        if (parts.length >= 3) correlative = parts[2];
      }

      try {
        const response = await api.get(
          `/accidents/next-correlative?year=${formData.accidentDate.split("-")[0]}&nature=${formData.accidentNature}&prefix=${formData.regionPrefix || "32"}`,
        );
        if (response && !response.err && response.count !== undefined) {
          correlative = String(response.count).padStart(3, "0");
        }
      } catch (e) {
        console.error("Error fetching correlative", e);
      }

      const newControlNumber = `${prefix}-${yearSuffix}-${correlative}-${natureCode}`;
      console.log("Generando nuevo número de control:", newControlNumber);

      setFormData((prev) => {
        if (prev.accidentControlNumber === newControlNumber) return prev;
        return {
          ...prev,
          accidentControlNumber: newControlNumber,
        };
      });
    };

    generateControlNumber();
  }, [formData.accidentDate, formData.accidentNature, formData.regionPrefix]);

  const filteredEmployees =
    employeeSearch.length > 1 && catalogs?.employees
      ? catalogs.employees
          .filter(
            (emp) =>
              `${emp.firstName} ${emp.lastName}`
                .toLowerCase()
                .includes(employeeSearch.toLowerCase()) ||
              emp.personalNumber
                ?.toLowerCase()
                .includes(employeeSearch.toLowerCase()) ||
              emp.idCard?.toLowerCase().includes(employeeSearch.toLowerCase()),
          )
          .filter(
            (emp) =>
              !formData.affectedPersonnel.find(
                (p) => p.personalNumber === emp.personalNumber,
              ),
          )
      : [];

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [
          facilities,
          accidentTypes,
          damageAgents,
          contactTypes,
          periods,
          fileDocuments,
          employees,
          inspectionStatus,
          managements,
          medicalCenters,
          injuryTypes,
          magnitudes,
        ] = await Promise.all([
          api.get("/facilities"),
          api.get("/lookups/accident-types"),
          api.get("/lookups/damage-agents"),
          api.get("/lookups/contact-types"),
          api.get("/lookups/periods"),
          api.get("/lookups/file-documents"),
          api.get("/employees"),
          api.get("/lookups/inspection-status"),
          api.get("/lookups/managements"),
          api.get("/lookups/medical-centers"),
          api.get("/lookups/injury-types"),
          api.get("/lookups/magnitudes"),
        ]);

        const flatten = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.reduce((acc, item) => {
            acc.push(item);
            if (item.children && item.children.length > 0) {
              acc.push(
                ...item.children.map((c) => ({ ...c, name: `└─ ${c.name}` })),
              );
            }
            return acc;
          }, []);
        };

        setCatalogs({
          facilities: facilities.err
            ? []
            : Array.isArray(facilities)
              ? facilities
              : [],
          accidentTypes: accidentTypes.err
            ? []
            : Array.isArray(accidentTypes)
              ? accidentTypes
              : [],
          damageAgents: damageAgents.err
            ? []
            : Array.isArray(damageAgents)
              ? damageAgents
              : [],
          contactTypes: contactTypes.err
            ? []
            : Array.isArray(contactTypes)
              ? contactTypes
              : [],
          periods: periods.err ? [] : Array.isArray(periods) ? periods : [],
          fileDocuments: fileDocuments.err
            ? []
            : Array.isArray(fileDocuments)
              ? fileDocuments
              : [],
          employees: employees.err
            ? []
            : Array.isArray(employees)
              ? employees
              : [],
          inspectionStatuses: inspectionStatus.err
            ? []
            : Array.isArray(inspectionStatus)
              ? inspectionStatus
              : [],
          managements: managements.err
            ? []
            : Array.isArray(managements)
              ? managements
              : [],
          medicalCenters: medicalCenters.err
            ? []
            : Array.isArray(medicalCenters)
              ? medicalCenters
              : [],
          injuryTypes: injuryTypes.err
            ? []
            : Array.isArray(injuryTypes)
              ? injuryTypes
              : [],
          magnitudes: magnitudes.err
            ? []
            : Array.isArray(magnitudes)
              ? magnitudes
              : [],
        });
      } catch (error) {
        showNotification("Error al cargar catálogos técnicos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accidentDate) {
      newErrors.accidentDate = "Fecha obligatoria";
    } else {
      const accDate = new Date(formData.accidentDate);
      const today = new Date();
      if (accDate > today) {
        newErrors.accidentDate = "La fecha del accidente no puede ser futura";
      }
    }

    if (!formData.accidentTime) {
      newErrors.accidentTime = "Hora obligatoria";
    } else if (formData.accidentDate) {
      const exactAccidentDateTime = new Date(
        `${formData.accidentDate}T${formData.accidentTime}`,
      );
      const now = new Date();

      if (exactAccidentDateTime > now) {
        newErrors.accidentTime = "La hora del accidente no pueden ser futura";
      }
    }

    if (locationType === "facility" && !formData.facilityId)
      newErrors.facilityId = "Sede obligatoria";

    if (!formData.managementId)
      newErrors.managementId = "Gerencia Involucrada obligatoria";

    if (
      locationType === "custom" &&
      (!incidentLocation.stateId || !formData.customAddressDetails)
    ) {
      newErrors.location =
        "Ubicación externa y dirección detallada obligatorias";
    }

    if (!formData.description)
      newErrors.description = "Descripción obligatoria";
    if (!formData.activity)
      newErrors.activity = "Actividad del trabajador obligatoria";

    if (!formData.magnitudeId) newErrors.magnitudeId = "Magnitud obligatoria";
    if (!formData.periodId) newErrors.periodId = "Periodo/Año obligatorio";
    if (!formData.accidentTypeId)
      newErrors.accidentTypeId = "Tipo de accidente obligatorio";

    // Nuevas validaciones de la sección Causa
    if (!formData.workType) newErrors.workType = "Tipo de trabajo obligatorio";
    if (!formData.hazardCode)
      newErrors.hazardCode = "Peligro (agente o condición) obligatorio";
    if (!formData.contactExposureCode)
      newErrors.contactExposureCode =
        "Tipo de exposición o contacto obligatorio";
    if (!formData.affectationClassCode)
      newErrors.affectationClassCode = "Clase de afectación obligatoria";
    if (!formData.affectationSubjectCode)
      newErrors.affectationSubjectCode = "Sujeto de afectación obligatorio";
    if (!formData.assetsProcessAffectation)
      newErrors.assetsProcessAffectation =
        "Valor de afectación a bienes o procesos obligatorio";

    // Validate witnesses if any are registered
    if (witnesses && witnesses.length > 0) {
      const witnessErrors = [];
      witnesses.forEach((w, idx) => {
        if (!w.name.trim()) {
          witnessErrors.push(`Nombre vacío en Testigo #${idx + 1}`);
        }
        if (w.idCard && !/^\d{5,8}$/.test(w.idCard.trim())) {
          witnessErrors.push(
            `Cédula incorrecta en Testigo #${idx + 1} (debe tener entre 5 y 8 dígitos)`,
          );
        }
        if (w.phone) {
          const cleanPhone = w.phone.replace(/\D/g, "");
          if (cleanPhone.length > 0) {
            const isValidVenezuelan =
              /^0(412|414|424|416|426|2\d{2})\d{7}$/.test(cleanPhone) ||
              /^58(412|414|424|416|426|2\d{2})\d{7}$/.test(cleanPhone);
            if (!isValidVenezuelan) {
              witnessErrors.push(
                `Teléfono incorrecto en Testigo #${idx + 1} (debe ser un número venezolano válido, ej: 04141234567 o 02121234567)`,
              );
            }
          }
        }
      });
      if (witnessErrors.length > 0) {
        newErrors.witnesses = witnessErrors.join(". ");
      }
    }

    // Validar días de reposo mínimos si tiene lesión
    if (formData.affectedPersonnel && formData.affectedPersonnel.length > 0) {
      const personnelErrors = [];
      formData.affectedPersonnel.forEach((p, idx) => {
        if (p.injuryLevel && p.injuryLevel !== "0") {
          const days = p.restDays === undefined ? 0 : parseInt(p.restDays);
          if (days < 2) {
            personnelErrors.push(
              `El trabajador ${p.firstName} ${p.lastName} tiene lesión, por lo tanto requiere un mínimo de 2 días de reposo`,
            );
          }
        }
      });
      if (personnelErrors.length > 0) {
        newErrors.personnel = personnelErrors.join(". ");
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "accidentControlNumber") {
      setIsManuallyEdited(true);
    }

    if (name === "medicalCenterId") {
      const center = catalogs.medicalCenters.find(
        (c) => c.id === parseInt(value),
      );
      if (center) {
        setFormData((prev) => ({
          ...prev,
          medicalCenterId: value,
          medicalCenterName: center.name,
          medicalCenterAddress: center.address || "",
        }));
        if (center.parish) {
          setMedicalLocation({
            stateId: center.parish.city?.stateId || "",
            cityId: center.parish.cityId || "",
            parish: center.parishId || "",
          });
        }
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleLocationChange = (geoData) => {
    setIncidentLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
  };

  const handleMedicalGeoChange = (geoData) => {
    setMedicalLocation({
      stateId: geoData.stateId,
      cityId: geoData.cityId,
      parish: geoData.parish,
    });
    setFormData((prev) => ({
      ...prev,
      medicalCenterAddress: geoData.fullText,
    }));
  };

  const addWitness = () => {
    setWitnesses([...witnesses, { name: "", idCard: "", phone: "" }]);
  };

  const removeWitness = (index) => {
    setWitnesses(witnesses.filter((_, i) => i !== index));
  };

  const updateWitness = (index, field, value) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index][field] = value;
    setWitnesses(newWitnesses);
  };

  const generateDescriptionAI = () => {
    if (!formData.accidentDate || !formData.accidentTime) {
      showNotification(
        "Por favor, ingrese al menos la fecha y hora del suceso para autogenerar el reporte.",
        "warning",
      );
      return;
    }

    // 1. Gather all form information
    const employeeNames =
      formData.affectedPersonnel && formData.affectedPersonnel.length > 0
        ? formData.affectedPersonnel
            .map((p) => `${p.firstName} ${p.lastName}`)
            .join(", ")
        : "el personal de guardia";

    const facilityObj = catalogs.facilities.find(
      (f) => String(f.id) === String(formData.facilityId),
    );
    const facilityName =
      locationType === "facility" && facilityObj
        ? facilityObj.name
        : formData.customAddressDetails || "la ubicación externa especificada";

    const managementObj = catalogs.managements.find(
      (m) => String(m.id) === String(formData.managementId),
    );
    const managementName = managementObj ? managementObj.name : "";

    const typeObj = catalogs.accidentTypes.find(
      (t) => String(t.id) === String(formData.accidentTypeId),
    );
    const typeName = typeObj
      ? typeObj.name.replace(/└─\s*/, "")
      : "accidente de trabajo";

    const agentObj = catalogs.damageAgents.find(
      (a) => String(a.id) === String(formData.damageAgentId),
    );
    const agentName = agentObj ? agentObj.name.replace(/└─\s*/, "") : null;

    const contactObj = catalogs.contactTypes.find(
      (c) => String(c.id) === String(formData.contactTypeId),
    );
    const contactName = contactObj
      ? contactObj.name.replace(/└─\s*/, "")
      : null;

    // 2. Format Date
    let formattedDate = formData.accidentDate;
    try {
      const dateParts = formData.accidentDate.split("-");
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
    } catch (e) {}

    // 3. Draft professional report
    let text = `El día ${formattedDate} aproximadamente a las ${formData.accidentTime}, se registró un Accidente de tipo técnico-operativo en las instalaciones de ${facilityName}`;
    if (managementName) {
      text += `, afectando el área adscrita a la gerencia de ${managementName}`;
    }
    text += `. En el suceso se vio involucrado el siguiente personal: ${employeeNames}`;

    if (formData.activity) {
      text += `, quien(es) al momento del percance realizaba(n) la actividad de: "${formData.activity.trim()}"`;
    } else {
      text += `, en el cumplimiento de sus labores asignadas de servicio`;
    }

    text += `. El evento fortuito se clasifica formalmente bajo la categoría de "${typeName}"`;

    if (agentName || contactName) {
      text += `, originado por `;
      if (contactName)
        text += `un contacto directo de tipo "${contactName.toLowerCase()}"`;
      if (agentName)
        text += `${contactName ? " con " : ""}"${agentName.toLowerCase()}"`;
    }

    text += `. Se procesa el presente informe oficial con el fin de iniciar las investigaciones de rigor, determinar causas raíz y establecer los planes de acción correctivos y preventivos necesarios en conjunto con la Unidad de Seguridad e Higiene Ocupacional (ASHO).`;

    // 4. Implement typing effect (micro-animation)
    let currentText = "";
    let i = 0;
    setFormData((prev) => ({
      ...prev,
      description: "Analizando datos y redactando...",
    }));

    const interval = setInterval(() => {
      if (i < text.length) {
        currentText += text.substring(0, i + 4);
        setFormData((prev) => ({
          ...prev,
          description: text.substring(0, i + 4),
        }));
        i += 4;
      } else {
        setFormData((prev) => ({ ...prev, description: text }));
        clearInterval(interval);
        showNotification(
          "¡Reporte técnico autogenerado correctamente!",
          "success",
        );
      }
    }, 12);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab !== "docs") {
      return;
    }
    const { isValid, errors: validationErrors } = validateForm();
    if (!isValid) {
      if (validationErrors.witnesses) {
        showNotification(validationErrors.witnesses, "error");
        return;
      }
      if (validationErrors.personnel) {
        showNotification(validationErrors.personnel, "error");
        return;
      }
      if (
        validationErrors.accidentDate &&
        validationErrors.accidentDate ===
          "La fecha del accidente no puede ser futura"
      ) {
        showNotification(validationErrors.accidentDate, "error");
        return;
      }

      if (
        validationErrors.accidentTime &&
        validationErrors.accidentTime ===
          "La hora del accidente no pueden ser futura"
      ) {
        showNotification(validationErrors.accidentTime, "error");
        return;
      }

      const currentErrors = {};
      if (!formData.accidentDate) currentErrors.d = "Fecha";
      if (!formData.accidentTime) currentErrors.t = "Hora";
      if (locationType === "facility" && !formData.facilityId)
        currentErrors.f = "Sede";
      if (!formData.managementId) currentErrors.m = "Gerencia";
      if (
        locationType === "custom" &&
        (!incidentLocation.stateId || !formData.customAddressDetails)
      )
        currentErrors.l = "Ubicación Geográfica";
      if (!formData.description) currentErrors.desc = "Descripción";
      if (!formData.activity) currentErrors.act = "Actividad";
      if (!formData.accidentTypeId) currentErrors.at = "Tipo Accidente";
      if (!formData.magnitudeId) currentErrors.mag = "Magnitud";
      if (!formData.workType) currentErrors.wt = "Tipo de Trabajo";
      if (!formData.hazardCode) currentErrors.hz = "Peligro";
      if (!formData.contactExposureCode)
        currentErrors.ce = " Tipo de Exposición";
      if (!formData.affectationClassCode)
        currentErrors.ac = " Clase Afectación";
      if (!formData.affectationSubjectCode)
        currentErrors.as = "Sujeto Afectación";
      if (!formData.assetsProcessAffectation)
        currentErrors.apa = " Afectación Bienes/Procesos";

      if (!formData.periodId) {
        if (formData.accidentDate) {
          const year = formData.accidentDate.split("-")[0];
          showNotification(
            `El año ${year} no está registrado en los períodos del sistema. Por favor, registre este período primero.`,
            "error",
          );
          return;
        } else {
          currentErrors.p = "Periodo (requiere fecha)";
        }
      }

      const missingNames = Object.values(currentErrors).join(", ");
      if (missingNames) {
        showNotification(
          `Faltan campos obligatorios: ${missingNames}`,
          "error",
        );
      }
      return;
    }

    // Determine the status automatically based on documents checklist
    let calculatedStatusId = 2; // Default: En Proceso (if catalogs.fileDocuments is empty or not loaded)
    if (catalogs.fileDocuments && catalogs.fileDocuments.length > 0) {
      if (formData.documentsCheck.length === catalogs.fileDocuments.length) {
        calculatedStatusId = 3; // Completada (all checks checked)
      } else {
        calculatedStatusId = 1; // Pendiente (some checks missing)
      }
    }

    const finalData = {
      ...formData,
      processStatusId: calculatedStatusId, // Automatically calculated
      magnitudeId: formData.magnitudeId ? parseInt(formData.magnitudeId) : null,
      locationType,
      incidentLocation: locationType === "custom" ? incidentLocation : null,
      parishId: locationType === "custom" ? incidentLocation.parish : null,
      assetsProcessAffectation: formData.assetsProcessAffectation || null,
      accidentControlNumber: formData.accidentControlNumber,
      accidentNature: formData.accidentNature,
      regionPrefix: formData.regionPrefix,
      // Mapeo explícito a snake_case para asegurar la persistencia en el backend
      accident_control_number: formData.accidentControlNumber,
      accident_nature: formData.accidentNature,
      region_prefix: formData.regionPrefix,
      involvedEmployees: formData.affectedPersonnel.map((p) => ({
        employeeId: p.personalNumber,
        injuryTypeId: p.injuryTypeId ? parseInt(p.injuryTypeId) : null,
        magnitudeId: p.magnitudeId ? parseInt(p.magnitudeId) : null,
        restDays: p.restDays !== undefined ? parseInt(p.restDays) : null,
        affectedArea: p.affectedArea || null,
        injuryNature: p.injuryNature || null,
        injuryLevel: p.injuryLevel || null,
        injuryConsequence: p.injuryConsequence || null,
      })),
      witnesses,
      documentsCheck: formData.documentsCheck.map((docId) => ({
        documentId: docId,
      })),
    };

    console.log("Objeto final que se enviará al Backend:", finalData);

    if (onSubmit) {
      await onSubmit(finalData);
    }
  };

  const tabsOrder = ["general", "details", "personnel", "medical", "docs"];

  const handleNextTab = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  const accidentYear = formData.accidentDate
    ? formData.accidentDate.split("-")[0]
    : null;
  const isPeriodFound =
    accidentYear && catalogs.periods
      ? catalogs.periods.some(
          (p) => String(p.annuality) === String(accidentYear),
        )
      : false;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
        activeTab === id
          ? "border-corpoelec-blue text-corpoelec-blue bg-corpoelec-blue/5 font-black uppercase tracking-tighter"
          : "border-transparent text-txt-muted hover:text-txt-main hover:bg-bg-main/5 font-bold uppercase tracking-tighter"
      }`}
    >
      <Icon size={18} />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Cabecera con Número de Control - Visible en todas las pestañas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-border-main rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-corpoelec-blue/10 rounded-2xl flex items-center justify-center text-corpoelec-blue shadow-inner">
            <Shield size={24} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em]">
              Número de Control de Accidente
            </h3>
            {formData.accidentControlNumber ? (
              <p className="text-lg font-black text-corpoelec-blue tracking-[0.3em] animate-in fade-in duration-300">
                {formData.accidentControlNumber}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-txt-muted/40 uppercase italic tracking-widest">
                Pendiente por generar...
              </p>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="px-4 py-2 bg-corpoelec-blue/5 border border-corpoelec-blue/20 rounded-xl">
            <span className="text-[9px] font-black text-corpoelec-blue uppercase tracking-widest">
              Modo Edición
            </span>
          </div>
        )}
      </div>

      <div className="flex border-b border-border-main overflow-x-auto no-scrollbar">
        <TabButton id="general" label="General" icon={Info} />
        <TabButton id="details" label="Causa" icon={Shield} />
        <TabButton id="personnel" label="Personal" icon={Users} />
        <TabButton id="medical" label="Testigos/Salud" icon={Stethoscope} />
        <TabButton id="docs" label="Docs" icon={FileText} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 size={40} className="text-corpoelec-blue animate-spin" />
            <p className="text-txt-muted font-black tracking-widest uppercase text-[10px]">
              Cargando catálogos técnicos...
            </p>
          </div>
        ) : (
          activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Calendar size={14} /> Fecha *
                  </label>
                  <input
                    type="date"
                    name="accidentDate"
                    required
                    value={formData.accidentDate}
                    onChange={handleChange}
                    className={`input-field h-12 ${errors.accidentDate ? "border-corpoelec-red" : ""}`}
                  />
                  {errors.accidentDate && (
                    <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                      {errors.accidentDate}
                    </p>
                  )}
                  {accidentYear &&
                    (isPeriodFound ? (
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1.5 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl w-fit animate-in fade-in duration-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span>
                          Período fiscal {accidentYear} asignado automáticamente
                        </span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-corpoelec-red font-bold mt-1.5 flex items-center gap-1.5 bg-corpoelec-red/10 border border-corpoelec-red/20 px-3 py-1.5 rounded-xl w-fit animate-in fade-in duration-300">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-corpoelec-red animate-pulse"></span>
                        <span>
                          Error: El año {accidentYear} no está registrado en los
                          períodos del sistema.
                        </span>
                      </p>
                    ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Clock size={14} /> Hora *
                  </label>
                  <input
                    type="time"
                    name="accidentTime"
                    required
                    value={formData.accidentTime}
                    onChange={handleChange}
                    className={`input-field h-12 ${errors.accidentTime ? "border-corpoelec-red" : ""}`}
                  />
                  {errors.accidentTime && (
                    <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                      {errors.accidentTime}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Shield size={14} /> Estado del Proceso *
                  </label>
                  <select
                    name="processStatusId"
                    disabled
                    value={formData.processStatusId}
                    onChange={handleChange}
                    className="input-field h-12 bg-bg-main/30 cursor-not-allowed opacity-75"
                  >
                    {catalogs.inspectionStatuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[8px] font-bold text-txt-muted uppercase mt-1">
                    Automático (En Proceso al editar, se calcula según checklist
                    al guardar)
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Shield size={14} /> Magnitud del Accidente *
                  </label>
                  <select
                    name="magnitudeId"
                    required
                    value={formData.magnitudeId}
                    onChange={handleChange}
                    className="input-field h-12"
                  >
                    <option value="">Seleccione magnitud...</option>
                    {catalogs.magnitudes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className={`bg-bg-main/5 p-1 rounded-2xl border border-border-main/50 flex gap-1 ${initialData ? "opacity-50 grayscale pointer-events-none" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setLocationType("facility")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "facility" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                >
                  <Home size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    En Sede
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType("custom")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${locationType === "custom" ? "bg-corpoelec-blue text-white shadow-lg shadow-corpoelec-blue/20" : "text-txt-muted hover:text-txt-main"}`}
                >
                  <MapIcon size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Otra Ubicación
                  </span>
                </button>
              </div>

              {locationType === "facility" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <MapPin size={14} /> Sede / Instalación Base *
                    </label>
                    <select
                      name="facilityId"
                      required
                      disabled={!!initialData}
                      value={formData.facilityId}
                      onChange={handleChange}
                      className={`input-field h-12 ${errors.facilityId ? "border-corpoelec-red" : ""} ${initialData ? "bg-bg-main/5 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Seleccione sede...</option>
                      {catalogs.facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    {errors.facilityId && (
                      <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                        {errors.facilityId}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="p-6 rounded-3xl border border-border-main/50 bg-corpoelec-blue/5">
                    <h4 className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] mb-6">
                      Ubicación Geográfica
                    </h4>
                    <GeographicCascade
                      value={incidentLocation}
                      onChange={handleLocationChange}
                      required={true}
                      disabled={!!initialData}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                      Dirección Detallada / Referencia *
                    </label>
                    <textarea
                      name="customAddressDetails"
                      required
                      disabled={!!initialData}
                      rows="3"
                      value={formData.customAddressDetails}
                      onChange={handleChange}
                      className={`input-field py-4 resize-none min-h-[100px] ${initialData ? "bg-bg-main/5 cursor-not-allowed" : ""}`}
                      placeholder="Km, sector, torre, etc."
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {activeTab === "details" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {formData.accidentControlNumber && (
              <div className="p-4 bg-corpoelec-blue/5 border border-corpoelec-blue/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-corpoelec-blue" />
                  <div>
                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">
                      Número de Control de Accidente
                    </p>
                    <p className="text-sm font-black text-corpoelec-blue tracking-wider">
                      {formData.accidentControlNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Causa Probable
              </label>
              <textarea
                name="activity"
                required
                rows="3"
                value={formData.activity}
                onChange={handleChange}
                className="input-field py-4 resize-none min-h-[100px]"
                placeholder="¿Qué estaba haciendo antes del accidente?"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorías Dinámicas y Autoregenerables de Accidente */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const selects = [];
                    let currentLevelNodes = ACCIDENT_HIERARCHY;

                    for (
                      let level = 0;
                      level <= selectedAccidentPath.length;
                      level++
                    ) {
                      if (!currentLevelNodes || currentLevelNodes.length === 0)
                        break;

                      const selectedValue = selectedAccidentPath[level] || "";
                      const levelNodes = currentLevelNodes;

                      selects.push(
                        <div
                          key={level}
                          className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            {level === 0
                              ? "Tipo de Accidente *"
                              : level === 1
                                ? "Subcategoría de Accidente *"
                                : `Detalle Nivel ${level + 1} *`}
                          </label>
                          <select
                            required
                            value={selectedValue}
                            onChange={(e) => {
                              const value = e.target.value;

                              const newPath = [
                                ...selectedAccidentPath.slice(0, level),
                              ];
                              if (value) {
                                newPath.push(value);
                              }
                              setSelectedAccidentPath(newPath);

                              let activeNode = null;
                              let searchNodes = ACCIDENT_HIERARCHY;
                              for (const code of newPath) {
                                activeNode = searchNodes.find(
                                  (n) => n.code === code,
                                );
                                if (activeNode)
                                  searchNodes = activeNode.children || [];
                              }

                              let dbMatch = null;
                              // Buscar el código más específico seleccionado en la base de datos (de atrás hacia adelante)
                              for (let i = newPath.length - 1; i >= 0; i--) {
                                const codeToSearch = newPath[i];
                                dbMatch = catalogs.accidentTypes.find(
                                  (t) => t.code === codeToSearch,
                                );
                                if (dbMatch) break;
                              }

                              setFormData((prev) => ({
                                ...prev,
                                accidentTypeId: dbMatch ? dbMatch.id : "",
                              }));

                              if (errors.accidentTypeId) {
                                setErrors((prev) => ({
                                  ...prev,
                                  accidentTypeId: null,
                                }));
                              }
                            }}
                            className={`input-field h-12 ${
                              errors.accidentTypeId &&
                              level === selectedAccidentPath.length
                                ? "border-corpoelec-red"
                                : ""
                            }`}
                          >
                            <option value="">Seleccione...</option>
                            {levelNodes.map((node) => (
                              <option key={node.code} value={node.code}>
                                {node.code} - {node.name}
                              </option>
                            ))}
                          </select>
                        </div>,
                      );

                      const nextNode = currentLevelNodes.find(
                        (n) => n.code === selectedValue,
                      );
                      currentLevelNodes = nextNode ? nextNode.children : null;
                    }

                    return selects;
                  })()}
                </div>
                {errors.accidentTypeId && (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.accidentTypeId}
                  </p>
                )}
              </div>

              {/* C.3. TIPO DE TRABAJO */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Tipo de Trabajo *
                </label>
                <select
                  required
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className="input-field h-12"
                >
                  <option value="">Seleccione tipo de trabajo...</option>
                  <option value="ordinario">C.3.1. Ordinario</option>
                  <option value="eventual">C.3.2. Eventual u ocasional</option>
                </select>
              </div>

              {/* C.4. PELIGRO (AGENTE O CONDICIÓN) - DINÁMICO */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border-main/50">
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Peligro (Agente o Condición) *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const selects = [];
                    let currentLevelNodes = HAZARD_HIERARCHY;

                    for (
                      let level = 0;
                      level <= selectedHazardPath.length;
                      level++
                    ) {
                      if (!currentLevelNodes || currentLevelNodes.length === 0)
                        break;

                      const selectedValue = selectedHazardPath[level] || "";
                      const levelNodes = currentLevelNodes;

                      selects.push(
                        <div
                          key={level}
                          className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            {level === 0
                              ? "Nivel Principal *"
                              : level === 1
                                ? "Categoría de Peligro *"
                                : `Detalle Nivel ${level + 1} *`}
                          </label>
                          <select
                            required
                            value={selectedValue}
                            onChange={(e) => {
                              const value = e.target.value;

                              const newPath = [
                                ...selectedHazardPath.slice(0, level),
                              ];
                              if (value) {
                                newPath.push(value);
                              }
                              setSelectedHazardPath(newPath);

                              let activeNode = null;
                              let searchNodes = HAZARD_HIERARCHY;
                              for (const code of newPath) {
                                activeNode = searchNodes.find(
                                  (n) => n.code === code,
                                );
                                if (activeNode)
                                  searchNodes = activeNode.children || [];
                              }

                              if (
                                activeNode &&
                                (!activeNode.children ||
                                  activeNode.children.length === 0)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  hazardCode: activeNode.code,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  hazardCode: "",
                                }));
                              }
                            }}
                            className="input-field h-12"
                          >
                            <option value="">Seleccione...</option>
                            {levelNodes.map((node) => (
                              <option key={node.code} value={node.code}>
                                {node.code} - {node.name}
                              </option>
                            ))}
                          </select>
                        </div>,
                      );

                      const nextNode = currentLevelNodes.find(
                        (n) => n.code === selectedValue,
                      );
                      currentLevelNodes = nextNode ? nextNode.children : null;
                    }

                    return selects;
                  })()}
                </div>
              </div>

              {/* C.5. TIPO DE EXPOSICIÓN O CONTACTO - DINÁMICO */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border-main/50">
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Tipo de Exposición o Contacto *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const selects = [];
                    let currentLevelNodes = CONTACT_EXPOSURE_HIERARCHY;

                    for (
                      let level = 0;
                      level <= selectedContactExposurePath.length;
                      level++
                    ) {
                      if (!currentLevelNodes || currentLevelNodes.length === 0)
                        break;

                      const selectedValue =
                        selectedContactExposurePath[level] || "";
                      const levelNodes = currentLevelNodes;

                      selects.push(
                        <div
                          key={level}
                          className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            {level === 0
                              ? "Exposición Principal *"
                              : level === 1
                                ? "Categoría de Exposición *"
                                : `Detalle Nivel ${level + 1} *`}
                          </label>
                          <select
                            required
                            value={selectedValue}
                            onChange={(e) => {
                              const value = e.target.value;

                              const newPath = [
                                ...selectedContactExposurePath.slice(0, level),
                              ];
                              if (value) {
                                newPath.push(value);
                              }
                              setSelectedContactExposurePath(newPath);

                              let activeNode = null;
                              let searchNodes = CONTACT_EXPOSURE_HIERARCHY;
                              for (const code of newPath) {
                                activeNode = searchNodes.find(
                                  (n) => n.code === code,
                                );
                                if (activeNode)
                                  searchNodes = activeNode.children || [];
                              }

                              if (
                                activeNode &&
                                (!activeNode.children ||
                                  activeNode.children.length === 0)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  contactExposureCode: activeNode.code,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  contactExposureCode: "",
                                }));
                              }
                            }}
                            className="input-field h-12"
                          >
                            <option value="">Seleccione...</option>
                            {levelNodes.map((node) => (
                              <option key={node.code} value={node.code}>
                                {node.code} - {node.name}
                              </option>
                            ))}
                          </select>
                        </div>,
                      );

                      const nextNode = currentLevelNodes.find(
                        (n) => n.code === selectedValue,
                      );
                      currentLevelNodes = nextNode ? nextNode.children : null;
                    }

                    return selects;
                  })()}
                </div>
              </div>

              {/* C.7. CLASE DE AFECTACIÓN - DINÁMICO */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border-main/50">
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Clase de Afectación *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const selects = [];
                    let currentLevelNodes = AFFECTATION_CLASS_HIERARCHY;

                    for (
                      let level = 0;
                      level <= selectedAffectationClassPath.length;
                      level++
                    ) {
                      if (!currentLevelNodes || currentLevelNodes.length === 0)
                        break;

                      const selectedValue =
                        selectedAffectationClassPath[level] || "";
                      const levelNodes = currentLevelNodes;

                      selects.push(
                        <div
                          key={level}
                          className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            {level === 0
                              ? "Clase Principal *"
                              : level === 1
                                ? "Grupo de Afectación *"
                                : `Detalle Nivel ${level + 1} *`}
                          </label>
                          <select
                            required
                            value={selectedValue}
                            onChange={(e) => {
                              const value = e.target.value;

                              const newPath = [
                                ...selectedAffectationClassPath.slice(0, level),
                              ];
                              if (value) {
                                newPath.push(value);
                              }
                              setSelectedAffectationClassPath(newPath);

                              let activeNode = null;
                              let searchNodes = AFFECTATION_CLASS_HIERARCHY;
                              for (const code of newPath) {
                                activeNode = searchNodes.find(
                                  (n) => n.code === code,
                                );
                                if (activeNode)
                                  searchNodes = activeNode.children || [];
                              }

                              if (
                                activeNode &&
                                (!activeNode.children ||
                                  activeNode.children.length === 0)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  affectationClassCode: activeNode.code,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  affectationClassCode: "",
                                }));
                              }
                            }}
                            className="input-field h-12"
                          >
                            <option value="">Seleccione...</option>
                            {levelNodes.map((node) => (
                              <option key={node.code} value={node.code}>
                                {node.code} - {node.name}
                              </option>
                            ))}
                          </select>
                        </div>,
                      );

                      const nextNode = currentLevelNodes.find(
                        (n) => n.code === selectedValue,
                      );
                      currentLevelNodes = nextNode ? nextNode.children : null;
                    }

                    return selects;
                  })()}
                </div>
              </div>

              {/* C.8. SUJETO DE LA AFECTACIÓN - DINÁMICO */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border-main/50">
                <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Sujeto de la Afectación *
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const selects = [];
                    let currentLevelNodes = AFFECTATION_SUBJECT_HIERARCHY;

                    for (
                      let level = 0;
                      level <= selectedAffectationSubjectPath.length;
                      level++
                    ) {
                      if (!currentLevelNodes || currentLevelNodes.length === 0)
                        break;

                      const selectedValue =
                        selectedAffectationSubjectPath[level] || "";
                      const levelNodes = currentLevelNodes;

                      selects.push(
                        <div
                          key={level}
                          className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                            {level === 0
                              ? "Sujeto Principal *"
                              : level === 1
                                ? "Categoría de Sujeto *"
                                : `Detalle Nivel ${level + 1} *`}
                          </label>
                          <select
                            required
                            value={selectedValue}
                            onChange={(e) => {
                              const value = e.target.value;

                              const newPath = [
                                ...selectedAffectationSubjectPath.slice(
                                  0,
                                  level,
                                ),
                              ];
                              if (value) {
                                newPath.push(value);
                              }
                              setSelectedAffectationSubjectPath(newPath);

                              let activeNode = null;
                              let searchNodes = AFFECTATION_SUBJECT_HIERARCHY;
                              for (const code of newPath) {
                                activeNode = searchNodes.find(
                                  (n) => n.code === code,
                                );
                                if (activeNode)
                                  searchNodes = activeNode.children || [];
                              }

                              if (
                                activeNode &&
                                (!activeNode.children ||
                                  activeNode.children.length === 0)
                              ) {
                                setFormData((prev) => ({
                                  ...prev,
                                  affectationSubjectCode: activeNode.code,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  affectationSubjectCode: "",
                                }));
                              }
                            }}
                            className="input-field h-12"
                          >
                            <option value="">Seleccione...</option>
                            {levelNodes.map((node) => (
                              <option key={node.code} value={node.code}>
                                {node.code} - {node.name}
                              </option>
                            ))}
                          </select>
                        </div>,
                      );

                      const nextNode = currentLevelNodes.find(
                        (n) => n.code === selectedValue,
                      );
                      currentLevelNodes = nextNode ? nextNode.children : null;
                    }

                    return selects;
                  })()}
                </div>
              </div>

              {/* C.10. AFECTACIÓN A BIENES O PROCESOS */}
              <div className="md:col-span-2 space-y-1 pt-4 border-t border-border-main/50">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Afectación a Bienes o Procesos *
                </label>
                <select
                  required
                  name="assetsProcessAffectation"
                  value={formData.assetsProcessAffectation}
                  onChange={handleChange}
                  className="input-field h-12"
                >
                  <option value="">Seleccione valor de afectación...</option>
                  <option value="0">0 - Sin afectación</option>
                  <option value="1">1 - Leve</option>
                  <option value="2">2 - Moderada</option>
                  <option value="3">3 - Grave o muy grave</option>
                  <option value="4">4 - Irrecuperable</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "medical" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em] ml-1">
                  Lista de Testigos
                </h4>
                <button
                  type="button"
                  onClick={addWitness}
                  className="btn-secondary h-10 px-4 text-xs"
                >
                  <UserPlus size={14} /> Registrar Testigo
                </button>
              </div>

              {witnesses.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-border-main rounded-3xl text-center bg-bg-main/5">
                  <Users size={32} className="mx-auto text-txt-muted/50 mb-3" />
                  <p className="text-txt-muted text-[10px] font-black uppercase tracking-widest italic">
                    Sin testigos registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {witnesses.map((witness, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-3 p-4 bg-bg-main/10 border border-border-main/50 rounded-2xl animate-in slide-in-from-top-2 duration-200"
                    >
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={witness.name}
                        onChange={(e) =>
                          updateWitness(index, "name", e.target.value)
                        }
                        className="input-field h-12 flex-[2] bg-bg-surface shadow-none"
                        maxLength={30}
                        onKeyDown={(e) => {
                          if (
                            !/[A-Za-zÁÉÍÓÚáéíóúÑñ ]/.test(e.key) &&
                            e.key !== "Backspace" &&
                            e.key !== "Delete" &&
                            e.key !== "Tab"
                          ) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Cédula"
                        value={witness.idCard}
                        onChange={(e) =>
                          updateWitness(index, "idCard", e.target.value)
                        }
                        className="input-field h-12 flex-1 bg-bg-surface shadow-none"
                        maxLength={8}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                            e.preventDefault();
                          }
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={witness.phone}
                        onChange={(e) =>
                          updateWitness(index, "phone", e.target.value)
                        }
                        className="input-field h-12 flex-1 bg-bg-surface shadow-none"
                        maxLength={12}
                        onKeyDown={(e) => {
                          if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                            e.preventDefault();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeWitness(index)}
                        className="p-3 text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-border-main">
              <div className="flex items-center gap-2 text-corpoelec-blue">
                <Stethoscope size={16} />
                <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">
                  Atención Médica
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Nombre del Centro de Salud (Catálogo)
                  </label>
                  <select
                    name="medicalCenterId"
                    value={formData.medicalCenterId}
                    onChange={handleChange}
                    className="input-field h-12"
                  >
                    <option value="">-- Seleccione del Catálogo --</option>
                    {catalogs.medicalCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Campo de respaldo por si no está en catálogo */}
                {!formData.medicalCenterId && (
                  <div className="space-y-1 col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] ml-1">
                      O escriba el nombre manualmente
                    </label>
                    <input
                      type="text"
                      name="medicalCenterName"
                      value={formData.medicalCenterName}
                      onChange={handleChange}
                      className="input-field h-12"
                      placeholder="Ej: Hospital Dr. Rafael Calles Sierra"
                    />
                  </div>
                )}
                <div className="col-span-1 md:col-span-2 bg-bg-main/5 p-6 rounded-3xl border border-border-main/50">
                  <p className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] mb-6">
                    Ubicación del Centro de Salud
                  </p>
                  <GeographicCascade
                    value={medicalLocation}
                    onChange={handleMedicalGeoChange}
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                    Diagnóstico Preliminar
                  </label>
                  <textarea
                    name="medicalObservations"
                    rows="3"
                    value={formData.medicalObservations}
                    onChange={handleChange}
                    className="input-field py-4 resize-none min-h-[100px]"
                    placeholder="Especifique qué atención recibió el trabajador..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "personnel" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em] ml-1">
                Trabajadores Afectados
              </h4>

              {/* Buscador de Personal */}
              <div className="relative w-full sm:w-72">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Vincular trabajador..."
                    className="input-field h-10 w-full !pl-12 text-[10px] font-black uppercase tracking-widest placeholder:text-txt-muted/50 focus:ring-2 focus:ring-corpoelec-blue/20 transition-all"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                  <Search
                    size={16}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-corpoelec-blue transition-colors"
                  />
                  {employeeSearch && (
                    <button
                      type="button"
                      onClick={() => setEmployeeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-corpoelec-red hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Resultados de búsqueda */}
                {filteredEmployees.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-main rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200 no-scrollbar">
                    <div className="p-2 border-b border-border-main bg-bg-main/5">
                      <p className="text-[8px] font-black text-txt-muted uppercase tracking-widest px-2">
                        Resultados ({filteredEmployees.length})
                      </p>
                    </div>
                    {filteredEmployees.map((emp) => (
                      <button
                        key={emp.personalNumber}
                        type="button"
                        className="w-full text-left p-3 hover:bg-corpoelec-blue/5 flex justify-between items-center group transition-colors"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            affectedPersonnel: [
                              ...formData.affectedPersonnel,
                              {
                                ...emp,
                                injuryTypeId: "",
                                magnitudeId: "",
                                restDays: 0,
                                affectedArea: "",
                                injuryNature: "",
                                injuryLevel: "",
                                injuryConsequence: "",
                              },
                            ],
                          });
                          setEmployeeSearch("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-bg-main border border-border-main rounded-full flex items-center justify-center font-black text-[10px] text-txt-muted group-hover:text-corpoelec-blue group-hover:border-corpoelec-blue/30 transition-all">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-txt-main group-hover:text-corpoelec-blue transition-colors">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[9px] font-black text-txt-muted uppercase tracking-tighter">
                              Personal: {emp.personalNumber}
                            </p>
                          </div>
                        </div>
                        <Plus
                          size={14}
                          className="text-txt-muted group-hover:text-corpoelec-blue opacity-0 group-hover:opacity-100 transition-all"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {employeeSearch.length > 1 &&
                  filteredEmployees.length === 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-main rounded-2xl p-4 shadow-xl text-center">
                      <p className="text-[10px] font-black text-txt-muted uppercase">
                        No se encontró personal
                      </p>
                    </div>
                  )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Briefcase size={14} /> Gerencia responsable *
                </label>
                <select
                  name="managementId"
                  required
                  value={formData.managementId}
                  onChange={handleChange}
                  className={`input-field h-12 transition-all ${
                    errors.managementId ? "border-corpoelec-red" : ""
                  }`}
                >
                  <option value="">Seleccione Gerencia...</option>
                  {catalogs.managements.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {formData.affectedPersonnel.length > 0 ? (
                  <p className="text-[9px] text-corpoelec-blue font-black uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-corpoelec-blue"></span>
                    Sugerido por el personal vinculado (puede cambiarlo si lo
                    desea)
                  </p>
                ) : errors.managementId ? (
                  <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                    {errors.managementId}
                  </p>
                ) : null}
              </div>
            </div>

            {formData.affectedPersonnel.length === 0 ? (
              <div className="p-20 border-2 border-dashed border-border-main/50 rounded-[2.5rem] text-center bg-bg-main/5 flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="h-20 w-20 bg-bg-surface border border-border-main rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Users size={36} className="text-txt-muted/20" />
                </div>
                <p className="text-txt-muted font-black uppercase tracking-[0.2em] text-[10px]">
                  No hay personal vinculado a este reporte.
                </p>
                <p className="text-txt-muted/50 text-[9px] font-bold mt-2 uppercase">
                  Utilice el buscador para añadir trabajadores afectados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {formData.affectedPersonnel.map((person) => (
                  <div
                    key={person.personalNumber}
                    className="p-6 bg-bg-surface border border-border-main rounded-[2rem] shadow-sm hover:shadow-md hover:border-corpoelec-blue/20 transition-all animate-in slide-in-from-bottom-2 duration-300 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-corpoelec-blue/5 text-corpoelec-blue border border-corpoelec-blue/10 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner">
                          {person?.firstName?.[0] || "?"}
                          {person?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <p className="text-xs font-black text-txt-main uppercase tracking-tight">
                            {person?.firstName || "N/A"}{" "}
                            {person?.lastName || ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-txt-muted uppercase tracking-tighter bg-bg-main px-2 py-0.5 rounded-md border border-border-main">
                              CI: {person?.idCard || "---"}
                            </span>
                            <span className="text-[9px] font-black text-corpoelec-blue uppercase tracking-tighter bg-corpoelec-blue/5 px-2 py-0.5 rounded-md border border-corpoelec-blue/10">
                              Nro: {person.personalNumber}
                            </span>
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
                              Gerencia:{" "}
                              {person.management?.name || "No especificada"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEmployeeCard(person)}
                          className="p-3 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-2xl transition-all"
                          title="Ver ficha de personal"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              affectedPersonnel:
                                formData.affectedPersonnel.filter(
                                  (p) =>
                                    p.personalNumber !== person.personalNumber,
                                ),
                            })
                          }
                          className="p-3 text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Controles de Lesión, Magnitud y Reposo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border-main/50">
                      {/* C.9.3 Nivel de la lesión (Puesto de primero para determinar si tiene lesión) */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-corpoelec-blue uppercase tracking-widest block ml-1">
                          C.9.3. Nivel de la lesión *
                        </label>
                        <select
                          required
                          value={person.injuryLevel || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? {
                                        ...p,
                                        injuryLevel: val,
                                        // Si es "Sin lesión" (0), limpiamos y bloqueamos los demás campos
                                        ...(val === "0"
                                          ? {
                                              injuryTypeId: "",
                                              restDays: 0,
                                              affectedArea: "10", // 10. Ubicaciones no especificadas
                                              injuryNature: "24", // 24. Tipo de lesión desconocida o sin especificar
                                              injuryConsequence: "0", // 0. Lesión sin discapacidad
                                            }
                                          : {
                                              // Si tiene lesión, por defecto ponemos mínimo 2 días de reposo si estaba en 0/vacío
                                              restDays:
                                                !p.restDays || p.restDays < 2
                                                  ? 2
                                                  : p.restDays,
                                            }),
                                      }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs border-corpoelec-blue/30 focus:border-corpoelec-blue"
                        >
                          <option value="">Seleccione nivel...</option>
                          {INJURY_LEVEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                          Tipo de Lesión
                        </label>
                        <select
                          disabled={person.injuryLevel === "0"}
                          value={person.injuryTypeId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? { ...p, injuryTypeId: val }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs disabled:bg-bg-main/40 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione lesión...</option>
                          {catalogs.injuryTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                          Días de Reposo
                        </label>
                        <input
                          type="number"
                          min="0"
                          disabled={person.injuryLevel === "0"}
                          value={
                            person.restDays === undefined ? "" : person.restDays
                          }
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? { ...p, restDays: val }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs disabled:bg-bg-main/40 disabled:cursor-not-allowed"
                          placeholder="Días"
                        />
                      </div>

                      {/* C.9.1 Área Afectada */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                          C.9.1. Área afectada
                        </label>
                        <select
                          disabled={person.injuryLevel === "0"}
                          value={person.affectedArea || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? { ...p, affectedArea: val }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs disabled:bg-bg-main/40 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione área...</option>
                          {AREA_AFFECTED_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* C.9.2 Naturaleza de la lesión */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                          C.9.2. Naturaleza de la lesión
                        </label>
                        <select
                          disabled={person.injuryLevel === "0"}
                          value={person.injuryNature || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? { ...p, injuryNature: val }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs disabled:bg-bg-main/40 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione naturaleza...</option>
                          {INJURY_NATURE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* C.9.4 Efecto / consecuencia de la lesión */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest block ml-1">
                          C.9.4. Efecto / consecuencia
                        </label>
                        <select
                          disabled={person.injuryLevel === "0"}
                          value={person.injuryConsequence || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              affectedPersonnel: prev.affectedPersonnel.map(
                                (p) =>
                                  p.personalNumber === person.personalNumber
                                    ? { ...p, injuryConsequence: val }
                                    : p,
                              ),
                            }));
                          }}
                          className="input-field h-10 text-xs disabled:bg-bg-main/40 disabled:cursor-not-allowed"
                        >
                          <option value="">Seleccione consecuencia...</option>
                          {INJURY_CONSEQUENCE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "docs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="p-6 rounded-[2.5rem] border border-corpoelec-blue/20 bg-corpoelec-blue/5 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-inner">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] ml-1">
                  Naturaleza del Accidente
                </label>
                <select
                  name="accidentNature"
                  value={formData.accidentNature}
                  onChange={handleChange}
                  required
                  className="input-field h-12 font-bold text-xs"
                >
                  <option value="">Seleccione naturaleza...</option>
                  <option value="P">Propio (P)</option>
                  <option value="TR">Tercero relacionado (TR)</option>
                  <option value="TNR">Tercero no relacionado (TNR)</option>
                  <option value="NL">No laborales (NL)</option>
                  <option value="A">Ambiental (A)</option>
                </select>
                <p className="text-[8px] font-bold text-txt-muted uppercase uppercase mt-1">
                  Define la última sigla del código
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] ml-1">
                  Prefijo Región (Estado)
                </label>
                <input
                  type="text"
                  name="regionPrefix"
                  maxLength={2}
                  value={formData.regionPrefix}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData((prev) => ({ ...prev, regionPrefix: val }));
                  }}
                  className="input-field h-12 text-center font-black text-lg"
                  placeholder="32"
                />
                <p className="text-[8px] font-bold text-txt-muted uppercase mt-1 text-center">
                  Táchira: 32 (Editable)
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-corpoelec-blue uppercase tracking-[0.2em] ml-1">
                  Número de Control *
                </label>
                <input
                  type="text"
                  name="accidentControlNumber"
                  required
                  value={formData.accidentControlNumber}
                  onChange={handleChange}
                  className="input-field h-12 text-center font-black text-lg tracking-[0.2em] border-2 border-corpoelec-blue focus:border-corpoelec-blue focus:ring-corpoelec-blue/10 uppercase"
                  placeholder="GENERANDO..."
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                Nro. Expediente INPSASEL
              </label>
              <input
                type="text"
                name="inpsaselFileNumber"
                readOnly
                value={formData.inpsaselFileNumber}
                className="input-field h-12 bg-bg-main/30 cursor-not-allowed italic"
                placeholder="Auto-generado por el sistema..."
              />
              <p className="text-[9px] font-black text-corpoelec-blue uppercase mt-1">
                El sistema asignará el correlativo INP-YYYY-XXXX al guardar.
              </p>
            </div>
            <div className="md:col-span-2 p-8 rounded-3xl border border-corpoelec-blue/20 bg-corpoelec-blue/5">
              <h4 className="text-xs font-black text-corpoelec-blue mb-6 flex items-center gap-2 uppercase tracking-widest">
                <FileText size={20} /> Checklist Documental
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogs.fileDocuments.map((doc) => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all p-4 rounded-2xl border ${
                      formData.documentsCheck.includes(doc.id)
                        ? "bg-corpoelec-blue/10 border-corpoelec-blue text-corpoelec-blue shadow-sm"
                        : "bg-bg-surface border-border-main/50 text-txt-muted hover:border-corpoelec-blue/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.documentsCheck.includes(doc.id)}
                      onChange={(e) => {
                        const newDocs = e.target.checked
                          ? [...formData.documentsCheck, doc.id]
                          : formData.documentsCheck.filter(
                              (id) => id !== doc.id,
                            );
                        setFormData({ ...formData, documentsCheck: newDocs });
                      }}
                      className="w-5 h-5 rounded-lg border-border-main bg-bg-surface text-corpoelec-blue focus:ring-corpoelec-blue/50 cursor-pointer"
                    />
                    {doc.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">
                  Descripción del Suceso *
                </label>
                <button
                  type="button"
                  onClick={generateDescriptionAI}
                  className="flex items-center gap-1.5 text-[9px] font-black text-corpoelec-blue uppercase tracking-widest hover:text-corpoelec-blue/80 bg-corpoelec-blue/5 border border-corpoelec-blue/10 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  ✨ Autogenerar Reporte
                </button>
              </div>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                className={`input-field py-4 resize-none min-h-[120px] ${errors.description ? "border-corpoelec-red" : ""}`}
                placeholder="Describa los hechos cronológicamente..."
              />
              {errors.description && (
                <p className="text-[9px] text-corpoelec-red font-black uppercase mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-between items-center translate-y-2">
          <div>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
            >
              Cancelar
            </button>
          </div>
          <div className="flex gap-3">
            {activeTab !== "general" && (
              <button
                type="button"
                onClick={handlePrevTab}
                className="px-6 py-3 border border-border-main/50 bg-bg-main/5 hover:bg-bg-main/10 rounded-xl text-xs font-black uppercase tracking-widest text-txt-main transition-all flex items-center gap-2"
              >
                ← Atrás
              </button>
            )}
            {activeTab !== "docs" ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="btn-primary flex items-center gap-2"
              >
                Siguiente →
              </button>
            ) : (
              <button type="submit" className="btn-primary">
                Guardar Reporte Técnico
              </button>
            )}
          </div>
        </div>

        {/* Mini Card de Personal */}
        {showEmployeeCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-bg-surface w-full max-w-sm rounded-[2.5rem] border border-border-main shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-16 w-16 bg-corpoelec-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-corpoelec-blue/20">
                    <User size={32} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmployeeCard(null)}
                    className="h-8 w-8 rounded-full hover:bg-bg-main flex items-center justify-center text-txt-muted transition-colors"
                  >
                    <Plus size={18} className="rotate-45" />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-lg font-black text-txt-main leading-tight">
                    {showEmployeeCard.firstName} {showEmployeeCard.lastName}
                  </h4>
                  <p className="text-[10px] font-black text-corpoelec-blue uppercase tracking-widest">
                    Ficha de Trabajador
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-7 w-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border-main">
                        <Briefcase size={14} className="text-corpoelec-blue" />
                      </div>
                      <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">
                        Datos Institucionales
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-txt-muted uppercase mb-0.5">
                          Gerencia
                        </p>
                        <p className="text-xs font-bold text-txt-main">
                          {showEmployeeCard.management?.name ||
                            "No especificada"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-txt-muted uppercase mb-0.5">
                          Ocupación Específica
                        </p>
                        <p className="text-xs font-bold text-txt-main">
                          {showEmployeeCard.occupation?.name ||
                            "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 text-center">
                      <p className="text-[9px] font-black text-txt-muted uppercase mb-1">
                        Cédula
                      </p>
                      <p className="text-xs font-black text-corpoelec-blue">
                        {showEmployeeCard.idCard}
                      </p>
                    </div>
                    <div className="p-4 bg-bg-main/50 rounded-2xl border border-border-main/50 text-center">
                      <p className="text-[9px] font-black text-txt-muted uppercase mb-1">
                        Personal
                      </p>
                      <p className="text-xs font-black text-corpoelec-blue">
                        {showEmployeeCard.personalNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmployeeCard(null)}
                className="w-full py-4 bg-bg-main border-t border-border-main text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] hover:text-corpoelec-blue transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
