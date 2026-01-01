#!/usr/bin/env node

/**
 * Database Migration Setup Checker
 * Verifies that all required environment variables and configurations are in place
 * before attempting a database migration from Famous.AI to Vercel Supabase.
 * 
 * Usage:
 *   node scripts/check-migration-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Database Migration Setup Checker\n');
console.log('═'.repeat(70));

let hasErrors = false;
let hasWarnings = false;
const errors = [];
const warnings = [];
const info = [];

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  errors.push(`Node.js version ${nodeVersion} is too old. Requires v18 or higher.`);
  hasErrors = true;
} else {
  info.push(`✅ Node.js version ${nodeVersion} is compatible`);
}

// Check for required environment variables
const requiredEnvVars = [
  { name: 'SOURCE_SUPABASE_URL', description: 'Famous.AI Supabase URL' },
  { name: 'SOURCE_SUPABASE_KEY', description: 'Famous.AI Service Role Key' },
  { name: 'TARGET_SUPABASE_URL', description: 'Vercel Supabase URL' },
  { name: 'TARGET_SUPABASE_KEY', description: 'Vercel Service Role Key' }
];

console.log('\n📋 Environment Variables Check\n');

requiredEnvVars.forEach(({ name, description }) => {
  if (process.env[name]) {
    const value = process.env[name];
    // Mask the key for security
    const displayValue = value.substring(0, 20) + '...' + value.substring(value.length - 10);
    console.log(`✅ ${name}`);
    console.log(`   Description: ${description}`);
    console.log(`   Value: ${displayValue}\n`);
  } else {
    console.log(`❌ ${name} - MISSING`);
    console.log(`   Description: ${description}\n`);
    errors.push(`Missing required environment variable: ${name} (${description})`);
    hasErrors = true;
  }
});

// Check for .env.local file
const envLocalPath = path.join(path.dirname(__dirname), '.env.local');
if (fs.existsSync(envLocalPath)) {
  info.push('✅ .env.local file exists');
  console.log('✅ .env.local file found\n');
} else {
  warnings.push('⚠️  .env.local file not found. You may need to create it from .env.example');
  hasWarnings = true;
  console.log('⚠️  .env.local file not found\n');
}

// Check for migration scripts
const scriptsToCheck = [
  'scripts/migrate-database.js',
  'scripts/verify-migration.js'
];

console.log('\n📄 Migration Scripts Check\n');

scriptsToCheck.forEach(scriptPath => {
  const fullPath = path.join(path.dirname(__dirname), scriptPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${scriptPath} exists`);
  } else {
    console.log(`❌ ${scriptPath} - MISSING`);
    errors.push(`Missing required script: ${scriptPath}`);
    hasErrors = true;
  }
});

// Check for Supabase client library
console.log('\n\n📦 Dependencies Check\n');

const packageJsonPath = path.join(path.dirname(__dirname), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
  
  if (hasSupabase) {
    console.log(`✅ @supabase/supabase-js@${packageJson.dependencies['@supabase/supabase-js']} installed`);
  } else {
    console.log('❌ @supabase/supabase-js - NOT INSTALLED');
    errors.push('Missing @supabase/supabase-js dependency. Run: npm install');
    hasErrors = true;
  }
} else {
  console.log('❌ package.json not found');
  errors.push('package.json not found');
  hasErrors = true;
}

// Check for node_modules
const nodeModulesPath = path.join(path.dirname(__dirname), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists\n');
} else {
  console.log('❌ node_modules directory not found\n');
  errors.push('node_modules not found. Run: npm install');
  hasErrors = true;
}

// Summary
console.log('\n' + '═'.repeat(70));
console.log('📊 Summary\n');

if (info.length > 0) {
  console.log('✅ Passed Checks:');
  info.forEach(i => console.log(`   ${i}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
  console.log('');
  hasWarnings = true;
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(e => console.log(`   ${e}`));
  console.log('');
}

console.log('═'.repeat(70));

if (hasErrors) {
  console.log('\n❌ Setup is INCOMPLETE. Please fix the errors above before running migration.\n');
  console.log('📖 Setup Instructions:\n');
  console.log('1. Copy .env.example to .env.local:');
  console.log('   cp .env.example .env.local\n');
  console.log('2. Edit .env.local and add your database credentials:');
  console.log('   - SOURCE_SUPABASE_URL: Your Famous.AI Supabase project URL');
  console.log('   - SOURCE_SUPABASE_KEY: Your Famous.AI Service Role Key');
  console.log('   - TARGET_SUPABASE_URL: Your Vercel/Target Supabase project URL');
  console.log('   - TARGET_SUPABASE_KEY: Your Vercel/Target Service Role Key\n');
  console.log('3. Load environment variables:');
  console.log('   export $(cat .env.local | xargs)\n');
  console.log('4. Run this checker again:');
  console.log('   node scripts/check-migration-setup.js\n');
  console.log('5. Once setup is complete, run the migration:');
  console.log('   npm run migrate:db --dry-run  # Test first');
  console.log('   npm run migrate:db            # Actual migration\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  Setup has warnings but can proceed. Review warnings above.\n');
  console.log('✅ Ready to run database migration!\n');
  console.log('Next steps:\n');
  console.log('1. Test with dry-run:');
  console.log('   node scripts/migrate-database.js --dry-run --debug\n');
  console.log('2. Verify current state:');
  console.log('   npm run verify:migration\n');
  console.log('3. Run migration:');
  console.log('   npm run migrate:db\n');
  process.exit(0);
} else {
  console.log('\n✅ Setup is COMPLETE! Ready to run database migration.\n');
  console.log('Next steps:\n');
  console.log('1. Test with dry-run:');
  console.log('   node scripts/migrate-database.js --dry-run --debug\n');
  console.log('2. Verify current state:');
  console.log('   npm run verify:migration\n');
  console.log('3. Run migration:');
  console.log('   npm run migrate:db\n');
  process.exit(0);
}
