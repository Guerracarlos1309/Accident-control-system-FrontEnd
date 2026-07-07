const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkVehicleSchema() {
  await client.connect();
  
  const tables = ['vehicle', 'inspection', 'vehicle_inspection', 'extinguisher_inspection', 'management', 'facility'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}'
    `);
    console.log(`\nTable ${table} Columns:`);
    console.table(res.rows);
  }
  
  await client.end();
}

checkVehicleSchema().catch(console.error);
