const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const projectRoot = path.resolve(__dirname, '..', '..');
const defaultMysqlPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';

const sqlFiles = [
  'ai_prompt_optimization_system.sql',
  'sample_data.sql',
  'triggers_and_views.sql',
  'stored_procedures.sql',
];

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];

const findMysqlClient = () => {
  if (fs.existsSync(defaultMysqlPath)) {
    return defaultMysqlPath;
  }
  return 'mysql';
};

const runSqlFile = (mysqlClient, file) => {
  const filePath = path.join(projectRoot, file);
  const normalizedPath = filePath.replace(/\\/g, '/');
  const command = `source ${normalizedPath}`;

  console.log(`Running ${file}`);

  const result = spawnSync(
    mysqlClient,
    ['-h', process.env.DB_HOST, '-u', process.env.DB_USER, '-e', command],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        MYSQL_PWD: process.env.DB_PASS,
      },
    }
  );

  if (result.status !== 0) {
    const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
    throw new Error(output || `mysql exited with status ${result.status}`);
  }
};

const run = async () => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(', ')}`);
  }

  const mysqlClient = findMysqlClient();

  for (const file of sqlFiles) {
    runSqlFile(mysqlClient, file);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    const [tables] = await connection.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = ?
       ORDER BY table_name`,
      [process.env.DB_NAME]
    );

    console.log(`Database '${process.env.DB_NAME}' is ready.`);
    console.log(`Tables: ${tables.map((row) => row.TABLE_NAME || row.table_name).join(', ')}`);
  } finally {
    await connection.end();
  }
};

run().catch((err) => {
  console.error(`Database setup failed: ${err.message}`);
  process.exit(1);
});
