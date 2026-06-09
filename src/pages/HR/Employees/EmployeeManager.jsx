import MasterEntityManager from "../../../components/MasterEntityManager";
import EmployeeForm from "./EmployeeForm";
import EmployeeDetails from "./EmployeeDetails";

export default function EmployeeManager() {
  return (
    <MasterEntityManager
      title="Directorio de Empleados"
      entityName="Empleado"
      apiPath="/employees"
      idField="personalNumber"
      fields={[
        { name: "personalNumber", label: "N° Personal" },
        { name: "idCard", label: "Cédula" },
        { name: "firstName", label: "Nombre" },
        { name: "lastName", label: "Apellido" },
        { name: "occupation", label: "Cargo", displayKey: "occupation" },
      ]}
      FormComponent={EmployeeForm}
      ViewComponent={EmployeeDetails}
      modalMaxWidth="max-w-4xl"
    />
  );
}
