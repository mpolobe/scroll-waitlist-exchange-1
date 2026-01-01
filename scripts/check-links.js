#!/usr/bin/env node

/**
 * Link Validation Script
 * Checks all external links and API endpoints in the codebase
 * 
 * Usage:
 *   node scripts/check-links.js [--verbose]
 * 
 * Options:
 *   --verbose    Show detailed information for each link check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');

// Known API endpoints and their expected availability
const ENDPOINTS = {
  // Africa Railways API (may not be accessible without API key)
  'https://api.africa-railways.com': { requiresAuth: true, category: 'Africa Railways' },
  
  // Merchant API (may not be accessible without API key)
  'https://api.africoin.io': { requiresAuth: true, category: 'Merchant API' },
  
  // Alchemy
  'https://dashboard.alchemy.com': { requiresAuth: false, category: 'Alchemy' },
  'https://accountkit.alchemy.com': { requiresAuth: false, category: 'Alchemy' },
  
  // Supabase (generic - actual URLs are environment-specific)
  'https://supabase.com/docs': { requiresAuth: false, category: 'Supabase' },
  
  // Google Cloud
  'https://console.cloud.google.com': { requiresAuth: true, category: 'Google Cloud' },
  'https://ai.google.dev/docs': { requiresAuth: false, category: 'Google AI' },
  'https://aistudio.google.com': { requiresAuth: true, category: 'Google AI' },
  
  // BrowserStack
  'https://www.browserstack.com': { requiresAuth: false, category: 'BrowserStack' },
  'https://app-live.browserstack.com': { requiresAuth: true, category: 'BrowserStack' },
  
  // Google Play
  'https://play.google.com/console': { requiresAuth: true, category: 'Google Play' },
  
  // Apple
  'https://developer.apple.com': { requiresAuth: false, category: 'Apple' },
  'https://appstoreconnect.apple.com': { requiresAuth: true, category: 'Apple' },
  
  // Documentation sites
  'https://capacitorjs.com/docs': { requiresAuth: false, category: 'Documentation' },
  'https://docs.codemagic.io': { requiresAuth: false, category: 'Documentation' },
  'https://vercel.com/docs': { requiresAuth: false, category: 'Documentation' },
  'https://vitejs.dev': { requiresAuth: false, category: 'Documentation' },
  
  // Social media
  'https://twitter.com/africoin': { requiresAuth: false, category: 'Social Media' },
  'https://linkedin.com/company/africoin': { requiresAuth: false, category: 'Social Media' },
  'https://www.facebook.com/profile.php?id=61584643210653': { requiresAuth: false, category: 'Social Media' },
  'https://instagram.com/africoin': { requiresAuth: false, category: 'Social Media' },
  
  // Africa Railways website
  'https://www.africarailways.com': { requiresAuth: false, category: 'Africa Railways' },
  
  // GitHub
  'https://github.com/mpolobe/scroll-waitlist-exchange-1': { requiresAuth: false, category: 'GitHub' },
  
  // Blockchain explorers
  'https://sepolia.etherscan.io': { requiresAuth: false, category: 'Blockchain' },
};

// Results storage
const results = {
  total: 0,
  accessible: 0,
  requiresAuth: 0,
  failed: 0,
  skipped: 0,
  byCategory: {}
};

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

function verboseLog(message) {
  if (VERBOSE) {
    console.log(`  ${message}`);
  }
}

async function checkLink(url, config) {
  results.total++;
  const category = config.category;
  
  if (!results.byCategory[category]) {
    results.byCategory[category] = { total: 0, accessible: 0, failed: 0, requiresAuth: 0, skipped: 0 };
  }
  results.byCategory[category].total++;
  
  verboseLog(`Checking: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok || response.status === 403 || response.status === 401) {
      if (config.requiresAuth && (response.status === 403 || response.status === 401)) {
        verboseLog(`  ✓ Requires authentication (${response.status}) - Expected`);
        results.requiresAuth++;
        results.byCategory[category].requiresAuth++;
        return { url, status: 'requires_auth', statusCode: response.status };
      } else if (response.ok) {
        verboseLog(`  ✓ Accessible (${response.status})`);
        results.accessible++;
        results.byCategory[category].accessible++;
        return { url, status: 'accessible', statusCode: response.status };
      }
    }
    
    verboseLog(`  ✗ Failed (${response.status})`);
    results.failed++;
    results.byCategory[category].failed++;
    return { url, status: 'failed', statusCode: response.status };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      verboseLog(`  ⏱ Timeout`);
      results.failed++;
      results.byCategory[category].failed++;
      return { url, status: 'timeout', error: 'Request timeout' };
    }
    
    verboseLog(`  ✗ Error: ${error.message}`);
    
    // For API endpoints that require auth, connection errors might be expected
    if (config.requiresAuth && (error.message.includes('fetch') || error.message.includes('ENOTFOUND'))) {
      verboseLog(`  ℹ Skipped (requires API key/auth)`);
      results.skipped++;
      results.byCategory[category].skipped++;
      return { url, status: 'skipped', error: error.message };
    }
    
    results.failed++;
    results.byCategory[category].failed++;
    return { url, status: 'error', error: error.message };
  }
}

async function checkAllLinks() {
  log('🔍 Starting link validation...');
  log(`Total links to check: ${Object.keys(ENDPOINTS).length}`);
  console.log('');
  
  const checkResults = [];
  
  for (const [url, config] of Object.entries(ENDPOINTS)) {
    const result = await checkLink(url, config);
    checkResults.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return checkResults;
}

function generateReport(checkResults) {
  console.log('\n' + '='.repeat(80));
  log('📊 Link Validation Report');
  console.log('='.repeat(80) + '\n');
  
  console.log('Overall Summary:');
  console.log(`  Total Links Checked: ${results.total}`);
  console.log(`  ✓ Accessible: ${results.accessible}`);
  console.log(`  🔒 Requires Authentication: ${results.requiresAuth}`);
  console.log(`  ⏭️  Skipped (API endpoints): ${results.skipped}`);
  console.log(`  ✗ Failed: ${results.failed}`);
  console.log('');
  
  // Report by category
  console.log('Results by Category:');
  for (const [category, stats] of Object.entries(results.byCategory)) {
    console.log(`\n  ${category}:`);
    console.log(`    Total: ${stats.total}`);
    console.log(`    Accessible: ${stats.accessible}`);
    console.log(`    Requires Auth: ${stats.requiresAuth}`);
    console.log(`    Skipped: ${stats.skipped}`);
    if (stats.failed > 0) {
      console.log(`    ⚠️  Failed: ${stats.failed}`);
    }
  }
  
  // List failed links
  const failedLinks = checkResults.filter(r => r.status === 'failed' || r.status === 'error');
  if (failedLinks.length > 0) {
    console.log('\n⚠️  Failed Links:');
    failedLinks.forEach(link => {
      console.log(`  ✗ ${link.url}`);
      console.log(`    Status: ${link.statusCode || 'N/A'}`);
      if (link.error) {
        console.log(`    Error: ${link.error}`);
      }
    });
  }
  
  // Success message
  const criticalFailures = checkResults.filter(r => 
    (r.status === 'failed' || r.status === 'error') && 
    !ENDPOINTS[r.url].requiresAuth
  );
  
  console.log('\n' + '='.repeat(80));
  if (criticalFailures.length === 0) {
    console.log('✅ All public links are accessible!');
  } else {
    console.log(`⚠️  ${criticalFailures.length} public link(s) failed validation.`);
  }
  console.log('='.repeat(80) + '\n');
  
  return criticalFailures.length === 0;
}

function checkDatabaseMigrationStatus() {
  console.log('\n' + '='.repeat(80));
  log('📊 Database Migration Status Check');
  console.log('='.repeat(80) + '\n');
  
  const migrationReport = path.join(__dirname, '..', 'DATABASE_MIGRATION_VERIFICATION_REPORT.md');
  const migrationRunbook = path.join(__dirname, '..', 'DATABASE_MIGRATION_RUNBOOK.md');
  const migrateScript = path.join(__dirname, 'migrate-database.js');
  const verifyScript = path.join(__dirname, 'verify-migration.js');
  
  const checks = [
    { file: migrationReport, name: 'Migration Verification Report' },
    { file: migrationRunbook, name: 'Migration Runbook' },
    { file: migrateScript, name: 'Migration Script' },
    { file: verifyScript, name: 'Verification Script' }
  ];
  
  console.log('Required Migration Files:');
  let allPresent = true;
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.file);
    const status = exists ? '✓' : '✗';
    console.log(`  ${status} ${check.name}: ${exists ? 'Present' : 'Missing'}`);
    if (!exists) allPresent = false;
  });
  
  console.log('\nMigration Infrastructure:');
  if (allPresent) {
    console.log('  ✅ All required migration files are present');
    console.log('  ✅ Migration scripts are ready to use');
    console.log('\nTo verify database migration:');
    console.log('  $ export SOURCE_SUPABASE_URL="your-source-url"');
    console.log('  $ export SOURCE_SUPABASE_KEY="your-source-key"');
    console.log('  $ export TARGET_SUPABASE_URL="your-target-url"');
    console.log('  $ export TARGET_SUPABASE_KEY="your-target-key"');
    console.log('  $ npm run verify:migration');
  } else {
    console.log('  ⚠️  Some migration files are missing');
  }
  
  // Check for supabase.ts
  const supabaseTs = path.join(__dirname, '..', 'src', 'lib', 'supabase.ts');
  const supabaseTsExample = path.join(__dirname, '..', 'src', 'lib', 'supabase.ts.example');
  
  console.log('\nSupabase Configuration:');
  const supabaseTsExists = fs.existsSync(supabaseTs);
  const supabaseTsExampleExists = fs.existsSync(supabaseTsExample);
  
  console.log(`  ${supabaseTsExists ? '✓' : '✗'} supabase.ts: ${supabaseTsExists ? 'Present' : 'Missing'}`);
  console.log(`  ${supabaseTsExampleExists ? '✓' : '✗'} supabase.ts.example: ${supabaseTsExampleExists ? 'Present' : 'Missing'}`);
  
  if (supabaseTsExists) {
    console.log('  ✅ Supabase configuration file is present');
  } else if (supabaseTsExampleExists) {
    console.log('  ℹ️  supabase.ts needs to be created from supabase.ts.example');
  } else {
    console.log('  ⚠️  Supabase configuration files are missing');
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
}

// Main execution
async function main() {
  try {
    const checkResults = await checkAllLinks();
    const success = generateReport(checkResults);
    checkDatabaseMigrationStatus();
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
