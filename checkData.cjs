const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkData() {
  await client.connect();
  
  console.log("\n--- Tables List ---");
  const tableRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.table(tableRes.rows);

  console.log("\n--- One row from vehicle ---");
  try {
    const vRes = await client.query("SELECT * FROM vehicle LIMIT 1");
    console.table(vRes.rows);
  } catch (e) {
    console.error(e.message);
  }

  console.log("\n--- One row from vehicle_inspection ---");
  try {
    const viRes = await client.query("SELECT * FROM vehicle_inspection LIMIT 1");
    console.table(viRes.rows);
  } catch (e) {
    console.error(e.message);
  }
  
  await client.end();
}

checkData().catch(console.error);
