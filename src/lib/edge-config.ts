/**
 * Vercel Edge Config Integration for Famous.AI
 * 
 * This module provides utilities to access database configuration
 * stored in Vercel Edge Config for the Famous.AI migration.
 */

import { createClient } from '@vercel/edge-config';

/**
 * Database configuration structure from Edge Config
 */
interface DatabaseConfig {
  supabase_url?: string;
  url?: string;
  supabase_key?: string;
  key?: string;
  service_role_key?: string;
  token?: string;
  project_id?: string;
}

/**
 * Initialize Edge Config client with the provided token
 */
export function getEdgeConfigClient(connectionString?: string) {
  const edgeConfigConnection = connectionString || process.env.EDGE_CONFIG || '';
  
  if (!edgeConfigConnection) {
    throw new Error('Edge Config connection string not provided. Set EDGE_CONFIG environment variable.');
  }
  
  return createClient(edgeConfigConnection);
}

/**
 * Retrieve database configuration from Edge Config
 * 
 * @param key - The configuration key to retrieve (default: 'famous-ai-database')
 * @returns Database configuration object
 */
export async function getDatabaseConfig(key: string = 'famous-ai-database'): Promise<DatabaseConfig> {
  const client = getEdgeConfigClient();
  
  try {
    const config = await client.get<DatabaseConfig>(key);
    
    if (!config) {
      throw new Error(`Configuration key '${key}' not found in Edge Config`);
    }
    
    return config;
  } catch (error) {
    console.error('Failed to retrieve database config from Edge Config:', error);
    throw error;
  }
}

/**
 * Get Famous.AI Supabase credentials from Edge Config
 */
export async function getFamousAICredentials() {
  const config = await getDatabaseConfig('famous-ai-database');
  
  return {
    url: config.supabase_url || config.url || '',
    key: config.supabase_key || config.key || config.service_role_key || '',
    token: config.token,
    projectId: config.project_id
  };
}

/**
 * Validate Edge Config connection
 */
export async function validateEdgeConfig() {
  try {
    const client = getEdgeConfigClient();
    const hasConfig = await client.has('famous-ai-database');
    
    return {
      connected: true,
      hasDatabase: hasConfig
    };
  } catch (error) {
    return {
      connected: false,
      hasDatabase: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
