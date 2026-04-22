import MasterEntityManager from "../../components/MasterEntityManager";

export default function LocationSetup() {
  return (
    <div className="space-y-8">
      <MasterEntityManager title="Estado / Provincias" entityName="Estado" />
      <MasterEntityManager title="Municipios y Ciudades" entityName="Ciudad" />
    </div>
  );
}
