require('dotenv').config({ path: '../.env' });
const models = require('../models');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    await models.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/2026-04-06-create-notifications.sql'),
      'utf8'
    );

    const statements = sql.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      await models.sequelize.query(stmt);
    }
    console.log('✅ Tabla `notifications` creada');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
