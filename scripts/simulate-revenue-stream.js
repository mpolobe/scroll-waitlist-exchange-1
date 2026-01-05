/**
 * simulate-revenue-stream.js
 * 
 * This script simulates the "Yield-from-Freight" model where USSD ticket sales
 * on the Sui Network (Utility Layer) are aggregated and bridged to the 
 * Polygon Treasury (Capital Layer).
 * 
 * Usage: node scripts/simulate-revenue-stream.js
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SUI_NETWORK = 'mainnet';
const POLYGON_TREASURY = '0xTreasuryAddress...';
const TICKET_PRICE_AFRC = 10;
const FREIGHT_TON_PRICE_AFRC = 500;

// Mock Data Generators
const generatePhoneNumber = () => `+26097${Math.floor(Math.random() * 10000000)}`;
const generateSuiAddress = () => `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

async function simulateTransaction(type) {
  const timestamp = new Date().toISOString();
  const userPhone = generatePhoneNumber();
  const userSuiAddress = generateSuiAddress();
  
  let amount = 0;
  let description = '';

  if (type === 'PASSENGER') {
    amount = TICKET_PRICE_AFRC;
    description = `Ticket Sale: Lusaka -> Ndola`;
  } else {
    amount = FREIGHT_TON_PRICE_AFRC;
    description = `Freight: 10 Tons Copper -> Lobito`;
  }

  console.log(`\n[${timestamp}] New USSD Transaction Detected via *384*26621#`);
  console.log(`Type: ${type}`);
  console.log(`User: ${userPhone} (Sui: ${userSuiAddress.substring(0, 10)}...)`);
  console.log(`Amount: ${amount} AFRC`);
  console.log(`Status: Verifying on Sui Network...`);
  
  await new Promise(r => setTimeout(r, 800)); // Simulate network latency
  
  console.log(`✅ Transaction Finalized on Sui (Object ID: ${generateSuiAddress().substring(0, 20)}...)`);
  
  // Bridge Logic
  console.log(`\n--- Bridging Revenue to Capital Layer ---`);
  console.log(`Source: Sui Utility Layer`);
  console.log(`Destination: Polygon Treasury (${POLYGON_TREASURY})`);
  console.log(`Bridging ${amount} AFRC...`);
  
  await new Promise(r => setTimeout(r, 1200)); // Simulate bridge time
  
  console.log(`✅ Value Locked in Sui Vault`);
  console.log(`✅ wAFRC Minted on Polygon`);
  console.log(`💰 Treasury Balance Updated: +${amount} wAFRC`);
  
  return { timestamp, type, amount, userSuiAddress };
}

async function runSimulation() {
  console.log('Starting "Digital Spine" Revenue Simulation...');
  console.log('Press Ctrl+C to stop.\n');

  // Simulate a mix of passenger and freight transactions
  while (true) {
    const isFreight = Math.random() > 0.8; // 20% chance of freight
    await simulateTransaction(isFreight ? 'FREIGHT' : 'PASSENGER');
    
    // Random delay between 2 and 5 seconds
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(r => setTimeout(r, delay));
  }
}

runSimulation();
