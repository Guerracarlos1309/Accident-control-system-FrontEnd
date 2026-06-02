const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function alterPostgres() {
  await client.connect();
  
  // Alter accident table
  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS work_type VARCHAR(50)`);
  console.log("Added work_type to accident in Postgres.");
  
  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS hazard_code VARCHAR(50)`);
  console.log("Added hazard_code to accident.");

  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS contact_exposure_code VARCHAR(50)`);
  console.log("Added contact_exposure_code to accident.");

  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS affectation_class_code VARCHAR(50)`);
  console.log("Added affectation_class_code to accident.");

  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS affectation_subject_code VARCHAR(50)`);
  console.log("Added affectation_subject_code to accident.");

  await client.query(`ALTER TABLE accident ADD COLUMN IF NOT EXISTS assets_process_affectation VARCHAR(50)`);
  console.log("Added assets_process_affectation to accident.");

  // Alter employee_accident table
  await client.query(`ALTER TABLE employee_accident ADD COLUMN IF NOT EXISTS affected_area VARCHAR(50)`);
  console.log("Added affected_area to employee_accident.");

  await client.query(`ALTER TABLE employee_accident ADD COLUMN IF NOT EXISTS injury_nature VARCHAR(50)`);
  console.log("Added injury_nature to employee_accident.");

  await client.query(`ALTER TABLE employee_accident ADD COLUMN IF NOT EXISTS injury_level VARCHAR(50)`);
  console.log("Added injury_level to employee_accident.");

  await client.query(`ALTER TABLE employee_accident ADD COLUMN IF NOT EXISTS injury_consequence VARCHAR(50)`);
  console.log("Added injury_consequence to employee_accident.");

  await client.end();
}

alterPostgres().catch(console.error);
