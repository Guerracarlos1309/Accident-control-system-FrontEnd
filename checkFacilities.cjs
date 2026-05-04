const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkFacilities() {
  await client.connect();
  
  const res = await client.query(`
    SELECT f.*, l.name as loc_name, l.parish_id
    FROM facility f
    LEFT JOIN location l ON f.location_id = l.id
    LIMIT 5
  `);
  
  console.log("Current Facilities in DB:");
  console.table(res.rows);
  
  await client.end();
}

checkFacilities().catch(console.error);
