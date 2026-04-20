import pg from 'pg';
const { Client } = pg;

const PROJECT_REF = 'uxjjptuhnquobjohunqs';
const DB_PASSWORD = 'K@53ee3627';

async function testConnection(host, port = 5432, user = 'postgres') {
  console.log(`Testing ${host}:${port} as ${user}...`);
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    console.log(`✅ Success for ${host}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ Failed for ${host}: ${err.message}`);
    return false;
  }
}

async function run() {
  const hosts = [
    { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres' },
    { host: `db.${PROJECT_REF}.supabase.com`, port: 5432, user: 'postgres' },
    { host: `aws-0-ca-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
    { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
  ];

  for (const h of hosts) {
    if (await testConnection(h.host, h.port, h.user)) {
      console.log(`\nFound working host: ${h.host}`);
      process.exit(0);
    }
  }
  process.exit(1);
}

run();
