// get-famous-ai-env.js
// Fetch Famous-AI environment variables from Vercel
const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'scroll-waitlist-exchange-1';

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN not set');
  console.error('');
  console.error('Get your Vercel token from:');
  console.error('https://vercel.com/account/tokens');
  console.error('');
  console.error('Then run:');
  console.error('export VERCEL_TOKEN="your-vercel-token"');
  process.exit(1);
}

async function getEnvironmentVariables() {
  try {
    console.log('🔍 Fetching environment variables from Vercel...\n');
    
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Found environment variables:\n');
    console.log('─────────────────────────────────────────');
    
    // Look for Supabase-related keys
    const supabaseVars = data.envs?.filter(env => 
      env.key.toLowerCase().includes('supabase') ||
      env.key.toLowerCase().includes('famous') ||
      env.key.toLowerCase().includes('database')
    );
    
    if (!supabaseVars || supabaseVars.length === 0) {
      console.log('⚠️  No Supabase-related variables found');
      console.log('\nAll variables:');
      data.envs?.forEach(env => {
        console.log(`  • ${env.key}`);
      });
      return;
    }
    
    console.log('Supabase/Database related variables:\n');
    
    supabaseVars.forEach(env => {
      console.log(`📌 ${env.key}`);
      console.log(`   Type: ${env.type}`);
      console.log(`   Target: ${env.target?.join(', ')}`);
      
      // Vercel encrypts values, but we can see if it's set
      if (env.value) {
        const preview = env.value.substring(0, 30) + '...';
        console.log(`   Value: ${preview}`);
        
        // Check if it looks like a Supabase key
        if (env.value.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
          console.log(`   ✅ This looks like a Supabase JWT token!`);
          
          if (env.key.toLowerCase().includes('service_role') || 
              env.key.toLowerCase().includes('secret')) {
            console.log(`   🔑 This might be the service_role key we need!`);
            console.log(`\n   Export command:`);
            console.log(`   export FAMOUS_AI_SUPABASE_KEY="${env.value}"`);
          }
        }
      }
      console.log('');
    });
    
    console.log('─────────────────────────────────────────');
    console.log('\n💡 Tips:');
    console.log('1. Look for keys named: SUPABASE_SERVICE_ROLE_KEY or similar');
    console.log('2. JWT tokens start with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    console.log('3. Use the service_role key for full database access');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('• Check your Vercel token is valid');
    console.error('• Verify the project ID:', VERCEL_PROJECT_ID);
    console.error('• You may need owner/admin access to the project');
  }
}

async function listProjects() {
  try {
    console.log('📋 Fetching your Vercel projects...\n');
    
    const response = await fetch(
      'https://api.vercel.com/v9/projects',
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Your Vercel projects:');
    console.log('─────────────────────────────────────────');
    data.projects?.forEach(project => {
      console.log(`• ${project.name} (ID: ${project.id})`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--list-projects')) {
  listProjects();
} else {
  getEnvironmentVariables();
}
