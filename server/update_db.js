import { initDb } from './db.js';

async function updateSchema() {
  console.log('🔄 Running database schema migration for University Interviews...');
  const db = await initDb();

  try {
    // Add interview_date to applications
    await db.run('ALTER TABLE applications ADD COLUMN interview_date DATE;');
    console.log('✅ Added column "interview_date" to "applications" table.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('ℹ️ Column "interview_date" already exists.');
    } else {
      throw err;
    }
  }

  try {
    // Add interview_status to applications
    await db.run("ALTER TABLE applications ADD COLUMN interview_status VARCHAR(50) DEFAULT 'Not Required';");
    console.log('✅ Added column "interview_status" to "applications" table.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('ℹ️ Column "interview_status" already exists.');
    } else {
      throw err;
    }
  }

  console.log('🎉 Schema update completed successfully!');
  process.exit(0);
}

updateSchema().catch(err => {
  console.error('❌ Schema update failed:', err);
  process.exit(1);
});
