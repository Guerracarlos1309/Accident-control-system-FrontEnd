import { Layers } from "lucide-react";
import MasterEntityManager from "../../../components/MasterEntityManager";

export default function ProtectionSetup() {
  return (
    <MasterEntityManager 
      icon={Layers}
      title="Categorías de Equipos" 
      entityName="Categoría" 
    />
  );
}
