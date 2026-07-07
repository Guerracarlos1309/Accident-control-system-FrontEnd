import { Briefcase, Network } from "lucide-react";
import MasterEntityManager from "../../components/MasterEntityManager";

export default function HRCatalogs() {
  return (
    <div className="space-y-8">
      <MasterEntityManager 
        icon={Briefcase}
        title="Gestión de Cargos" 
        entityName="Cargo" 
        apiPath="/lookups/occupations"
      />
      <MasterEntityManager 
        icon={Network}
        title="Gerencias" 
        entityName="Gerencia" 
        apiPath="/lookups/managements"
      />
    </div>
  );
}
