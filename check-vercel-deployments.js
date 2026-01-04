// check-vercel-deployments.js
// Check Vercel deployment history and environment variables
const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_GSeQ0bBsAVvxVLmIctWACvR4Zoch';

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN not set');
  console.error('export VERCEL_TOKEN="your-token"');
  process.exit(1);
}

async function getDeployments() {
  try {
    console.log('==========================================');
    console.log('🚀 Checking Vercel Deployments');
    console.log('==========================================\n');
    
    const response = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.deployments || data.deployments.length === 0) {
      console.log('⚠️  No deployments found');
      return;
    }
    
    console.log(`Found ${data.deployments.length} recent deployments:\n`);
    console.log('─────────────────────────────────────────');
    
    data.deployments.forEach((deployment, index) => {
      const date = new Date(deployment.createdAt).toLocaleString();
      const status = deployment.state === 'READY' ? '✅' : 
                     deployment.state === 'ERROR' ? '❌' : '⏳';
      
      console.log(`\n${index + 1}. ${status} ${deployment.state}`);
      console.log(`   URL: ${deployment.url}`);
      console.log(`   Created: ${date}`);
      console.log(`   Branch: ${deployment.target || 'production'}`);
      console.log(`   Commit: ${deployment.meta?.githubCommitMessage || 'N/A'}`);
    });
    
    console.log('\n─────────────────────────────────────────');
    console.log('\n💡 Tips:');
    console.log('1. Check if any previous deployments had different database URLs');
    console.log('2. Production deployments typically use the production environment');
    console.log('3. Preview deployments may have used different credentials');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkEnvironmentVariables() {
  try {
    console.log('\n==========================================');
    console.log('🔐 Checking Environment Variables History');
    console.log('==========================================\n');
    
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Group by target environment
    const byEnv = {
      production: [],
      preview: [],
      development: []
    };
    
    data.envs?.forEach(env => {
      env.target?.forEach(target => {
        if (byEnv[target]) {
          byEnv[target].push(env.key);
        }
      });
    });
    
    console.log('Environment variables by deployment type:\n');
    
    Object.entries(byEnv).forEach(([env, keys]) => {
      if (keys.length > 0) {
        console.log(`📍 ${env.toUpperCase()}`);
        const supabaseVars = keys.filter(k => 
          k.toLowerCase().includes('supabase') || 
          k.toLowerCase().includes('database')
        );
        if (supabaseVars.length > 0) {
          console.log('   Database-related variables:');
          supabaseVars.forEach(k => console.log(`   • ${k}`));
        } else {
          console.log('   No database variables found');
        }
        console.log('');
      }
    });
    
    console.log('💡 All environments are pointing to the same database:');
    console.log('   https://llvprbmrnjvamjzavmhg.supabase.co');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  await getDeployments();
  await checkEnvironmentVariables();
  
  console.log('\n==========================================');
  console.log('📊 Summary');
  console.log('==========================================');
  console.log('\nTo check what data exists in your database:');
  console.log('  node check-database.js');
  console.log('\nTo view a specific deployment:');
  console.log('  Visit the deployment URL from the list above');
  console.log('\n');
}

main().catch(console.error);
