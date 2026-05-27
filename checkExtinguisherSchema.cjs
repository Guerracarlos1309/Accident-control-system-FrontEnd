const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function checkSchema() {
  await client.connect();
  
  const res = await client.query(`
    SELECT table_name, column_name, character_maximum_length, data_type
    FROM information_schema.columns 
    WHERE character_maximum_length = 20
  `);
  
  console.log("Columns with VARCHAR(20):");
  console.table(res.rows);
  
  await client.end();
}

checkSchema().catch(console.error);
