const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkEmployeeAccidentColumns() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'employee_accident'
  `);
  console.log("employee_accident Table Columns:");
  console.table(res.rows);
  await client.end();
}

checkEmployeeAccidentColumns().catch(console.error);
