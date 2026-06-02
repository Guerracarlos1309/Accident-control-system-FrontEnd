const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkAccidentTypes() {
  await client.connect();
  const res = await client.query(`
    SELECT id, code, name 
    FROM accident_type
  `);
  console.log("Accident Types:");
  console.table(res.rows);
  await client.end();
}

checkAccidentTypes().catch(console.error);
