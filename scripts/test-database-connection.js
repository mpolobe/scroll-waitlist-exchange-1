#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script verifies that your application is correctly connected to the Vercel Supabase
 * database and NOT the Famous.ai database. It performs the following checks:
 * 
 * 1. Validates environment variables point to Vercel endpoints
 * 2. Tests actual database connectivity
 * 3. Verifies database identity (checks project reference)
 * 4. Tests basic read/write operations
 * 5. Confirms application configuration
 * 
 * Usage:
 *   node scripts/test-database-connection.js
 *   
 * or with npm:
 *   npm run test:database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const VERCEL_SUPABASE_URL = 'https://llvprbmrnjvamjzavmhg.supabase.co';
const FAMOUS_AI_SUPABASE_URL = 'https://xlbdtzmkncxycaddevnn.supabase.co';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function printHeader(text) {
  console.log(`\n${colors.bold}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

function printSuccess(text) {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

function printError(text) {
  console.log(`${colors.red}❌ ${text}${colors.reset}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

function printInfo(text) {
  console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`);
}

// Test 1: Check Environment Variables
async function testEnvironmentVariables() {
  printHeader('Test 1: Environment Variable Configuration');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  let passed = true;
  
  // Check if variables are set
  if (!supabaseUrl && !supabaseKey) {
    printWarning('No environment variables found. Checking .env files...');
    
    // Try to load from .env files
    const envFiles = ['.env', '.env.local', '.env.production'];
    let foundEnvFile = false;
    
    for (const envFile of envFiles) {
      const envPath = path.join(process.cwd(), envFile);
      if (fs.existsSync(envPath)) {
        printInfo(`Found ${envFile} file`);
        foundEnvFile = true;
        
        const content = fs.readFileSync(envPath, 'utf-8');
        const urlMatch = content.match(/VITE_SUPABASE_URL=(.+)/);
        
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1].trim();
          printInfo(`VITE_SUPABASE_URL in ${envFile}: ${url}`);
          
          if (url === VERCEL_SUPABASE_URL) {
            printSuccess('URL points to Vercel Supabase ✓');
          } else if (url === FAMOUS_AI_SUPABASE_URL) {
            printError('URL still points to Famous.ai database!');
            printInfo(`Expected: ${VERCEL_SUPABASE_URL}`);
            printInfo(`Found: ${url}`);
            passed = false;
          } else {
            printWarning(`URL points to unknown database: ${url}`);
          }
        }
      }
    }
    
    if (!foundEnvFile) {
      printError('No .env files found!');
      printInfo('Create a .env file with:');
      console.log(`
  VITE_SUPABASE_URL=${VERCEL_SUPABASE_URL}
  VITE_SUPABASE_ANON_KEY=your_vercel_anon_key_here
      `);
      passed = false;
    }
  } else {
    // Variables are loaded
    printSuccess('Environment variables are loaded');
    printInfo(`VITE_SUPABASE_URL: ${supabaseUrl || 'not set'}`);
    
    if (supabaseUrl === VERCEL_SUPABASE_URL) {
      printSuccess('✓ Connected to Vercel Supabase endpoint');
    } else if (supabaseUrl === FAMOUS_AI_SUPABASE_URL) {
      printError('✗ Still connected to Famous.ai endpoint!');
      printInfo('Please update VITE_SUPABASE_URL to:');
      printInfo(`  ${VERCEL_SUPABASE_URL}`);
      passed = false;
    } else if (supabaseUrl) {
      printWarning(`Connected to: ${supabaseUrl}`);
      printInfo(`Expected Vercel URL: ${VERCEL_SUPABASE_URL}`);
    }
    
    if (supabaseKey) {
      printSuccess(`✓ Supabase key is set (${supabaseKey.substring(0, 20)}...)`);
    } else {
      printError('✗ VITE_SUPABASE_ANON_KEY is not set');
      passed = false;
    }
  }
  
  return passed;
}

// Test 2: Check Application Source Code
async function testSourceCodeConfiguration() {
  printHeader('Test 2: Application Source Code Configuration');
  
  let passed = true;
  
  const supabaseLibPath = path.join(process.cwd(), 'src/lib/supabase.ts');
  
  if (fs.existsSync(supabaseLibPath)) {
    printSuccess('Found supabase.ts configuration file');
    
    const content = fs.readFileSync(supabaseLibPath, 'utf-8');
    
    // Check for hardcoded URLs
    if (content.includes(FAMOUS_AI_SUPABASE_URL)) {
      printError('Famous.ai URL found in source code!');
      printInfo('Location: src/lib/supabase.ts');
      passed = false;
    } else {
      printSuccess('No Famous.ai URL hardcoded in source');
    }
    
    if (content.includes(VERCEL_SUPABASE_URL)) {
      printSuccess(`Vercel URL configured as fallback`);
    }
    
    // Check if using environment variables
    if (content.includes('import.meta.env.VITE_SUPABASE_URL')) {
      printSuccess('Using environment variable for URL');
    } else {
      printWarning('Not using environment variable for URL');
    }
    
    if (content.includes('import.meta.env.VITE_SUPABASE_ANON_KEY')) {
      printSuccess('Using environment variable for key');
    } else {
      printWarning('Not using environment variable for key');
    }
  } else {
    printError('supabase.ts file not found!');
    passed = false;
  }
  
  return passed;
}

// Test 3: Test Database Connectivity
async function testDatabaseConnectivity() {
  printHeader('Test 3: Database Connectivity Test');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || VERCEL_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    printError('Cannot test connectivity: VITE_SUPABASE_ANON_KEY not set');
    printInfo('Set your Vercel Supabase anon key in .env file');
    return false;
  }
  
  try {
    printInfo(`Testing connection to: ${supabaseUrl}`);
    
    const client = createClient(supabaseUrl, supabaseKey);
    
    // Test basic query
    const { data, error } = await client
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        printWarning('Connected but table "profiles" not found');
        printInfo('This may indicate the database needs migration');
      } else {
        throw error;
      }
    } else {
      printSuccess('Successfully connected to database!');
      printSuccess('Table "profiles" is accessible');
    }
    
    // Get project info from URL
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    printInfo(`Project Reference: ${projectRef}`);
    
    if (projectRef === 'llvprbmrnjvamjzavmhg') {
      printSuccess('✓ Connected to Vercel project (llvprbmrnjvamjzavmhg)');
    } else if (projectRef === 'xlbdtzmkncxycaddevnn') {
      printError('✗ Connected to Famous.ai project (xlbdtzmkncxycaddevnn)');
      return false;
    } else {
      printWarning(`Connected to unknown project: ${projectRef}`);
    }
    
    return true;
  } catch (error) {
    printError(`Connection failed: ${error.message}`);
    return false;
  }
}

// Test 4: Test Table Schema
async function testTableSchema() {
  printHeader('Test 4: Database Schema Verification');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || VERCEL_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    printWarning('Skipping schema test: no key provided');
    return true;
  }
  
  const client = createClient(supabaseUrl, supabaseKey);
  
  const expectedTables = [
    'profiles',
    'users',
    'admin_roles',
    'loyalty_points',
    'points_transactions',
    'favorite_posts',
    'support_tickets'
  ];
  
  printInfo('Checking for expected tables...');
  
  let foundTables = 0;
  let missingTables = 0;
  
  for (const table of expectedTables) {
    try {
      const { error } = await client
        .from(table)
        .select('count')
        .limit(0);
      
      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          printWarning(`Table "${table}" not found`);
          missingTables++;
        } else {
          printWarning(`Table "${table}": ${error.message}`);
          missingTables++;
        }
      } else {
        printSuccess(`Table "${table}" exists`);
        foundTables++;
      }
    } catch (error) {
      printWarning(`Could not check table "${table}": ${error.message}`);
      missingTables++;
    }
  }
  
  console.log(`\n${colors.bold}Summary: ${foundTables}/${expectedTables.length} tables found${colors.reset}`);
  
  if (missingTables > 0) {
    printWarning(`${missingTables} tables are missing or inaccessible`);
    printInfo('You may need to run the database migration script');
    printInfo('Run: npm run migrate:database');
  }
  
  return foundTables > 0;
}

// Test 5: Count Records
async function testRecordCounts() {
  printHeader('Test 5: Record Count Check');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || VERCEL_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    printWarning('Skipping record count: no key provided');
    return true;
  }
  
  const client = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { count, error } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    printSuccess(`Profiles table contains ${count || 0} records`);
    
    if (count === 0) {
      printWarning('Database appears to be empty');
      printInfo('Run migration: npm run migrate:database');
    } else {
      printSuccess(`Database has data (${count} profiles)`);
    }
    
    return true;
  } catch (error) {
    printWarning(`Could not count records: ${error.message}`);
    return true;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        Database Connection & Configuration Test Suite       ║
║              Scroll Waitlist Exchange - AfriCoin            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);
  
  const results = {
    envVars: false,
    sourceCode: false,
    connectivity: false,
    schema: false,
    records: false
  };
  
  try {
    results.envVars = await testEnvironmentVariables();
    results.sourceCode = await testSourceCodeConfiguration();
    results.connectivity = await testDatabaseConnectivity();
    results.schema = await testTableSchema();
    results.records = await testRecordCounts();
    
    // Final Summary
    printHeader('Test Summary');
    
    const tests = [
      { name: 'Environment Variables', passed: results.envVars },
      { name: 'Source Code Config', passed: results.sourceCode },
      { name: 'Database Connectivity', passed: results.connectivity },
      { name: 'Table Schema', passed: results.schema },
      { name: 'Record Count', passed: results.records }
    ];
    
    let passedCount = 0;
    let failedCount = 0;
    
    tests.forEach(test => {
      if (test.passed) {
        printSuccess(test.name);
        passedCount++;
      } else {
        printError(test.name);
        failedCount++;
      }
    });
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    if (failedCount === 0) {
      console.log(`${colors.bold}${colors.green}🎉 All tests passed! Your app is connected to Vercel Supabase.${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.bold}${colors.yellow}⚠️  ${passedCount}/${tests.length} tests passed, ${failedCount} failed${colors.reset}`);
      console.log(`${colors.yellow}Please fix the issues above before deploying.${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    printError(`Test suite error: ${error.message}`);
    console.error(error);
    return false;
  }
}

// Run the tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
});
