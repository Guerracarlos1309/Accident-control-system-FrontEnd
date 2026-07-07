import { Archive } from "lucide-react";
import MasterEntityManager from "../../components/MasterEntityManager";
import FacilityForm from "./FacilityForm";
import FacilityView from "./FacilityView";

export default function InactiveFacilityManager() {
  return (
    <div className="space-y-8">
      <MasterEntityManager 
        icon={Archive}
        title="Sedes Inactivas / Histórico" 
        description="Listado de instalaciones fuera de servicio o desactivadas. Puede reactivarlas o eliminarlas definitivamente."
        entityName="Sede" 
        apiPath="/facilities?status=0" 
        deleteMode="hard"
        allowReactivate={true}
        FormComponent={FacilityForm}
        ViewComponent={FacilityView}
        fields={[
          { name: "name", label: "Nombre de Instalación" },
          { name: "voltageLevel", label: "Tensión (kV)" },
          { name: "installationType", label: "Tipo", displayKey: "installationType" },
          { name: "location", label: "Ubicación", displayKey: "location" }
        ]}
      />
    </div>
  );
}
