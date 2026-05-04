const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'Juan16052004',
  host: '127.0.0.1',
  port: 5432,
  database: 'accident_control',
});

async function createTable() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS facility_image (
      id SERIAL PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      facility_id INTEGER NOT NULL REFERENCES facility(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log("Table 'facility_image' created successfully.");
  
  await client.end();
}

createTable().catch(console.error);
