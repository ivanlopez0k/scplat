require('dotenv').config({ path: '../.env' });
const models = require('../models');

async function runMigration() {
  try {
    await models.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    await models.sequelize.query(
      'ALTER TABLE `grades` MODIFY COLUMN `note` DECIMAL(4,1) NOT NULL'
    );
    console.log('✅ Columna `note` alterada a DECIMAL(4,1)');

    const [result] = await models.sequelize.query('DESCRIBE `grades`');
    console.log('\nEstructura actual de `grades`:');
    result.forEach(row => {
      if (row.Field === 'note') {
        console.log(`  note: ${row.Type} | Null: ${row.Null} | Key: ${row.Key}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
