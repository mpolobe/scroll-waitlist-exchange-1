import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
  if (!API_KEY || API_KEY === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured. AI features will be disabled.');
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  userEmail?: string;
  walletAddress?: string;
  balance?: string;
  recentTransactions?: any[];
  currentPage?: string;
}

export async function sendChatMessage(
  message: string,
  context: ChatContext,
  history: ChatMessage[] = []
): Promise<string> {
  const ai = initializeGemini();
  
  if (!ai) {
    return "I'm currently unavailable. Please contact support at support@africoin.com for assistance.";
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = buildSystemPrompt(context);
    
    const conversationHistory = history
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm having trouble processing your request. Please try again or contact support.";
  }
}

function buildSystemPrompt(context: ChatContext): string {
  return `You are an AI assistant for Africoin, a cryptocurrency wallet and payment platform. You help users with:
- Wallet management and transactions
- Understanding blockchain and crypto concepts
- Railway booking integration
- Merchant payment processing
- Security and account settings
- Loyalty points and rewards

Current user context:
${context.userEmail ? `- Email: ${context.userEmail}` : ''}
${context.walletAddress ? `- Wallet: ${context.walletAddress.slice(0, 10)}...${context.walletAddress.slice(-8)}` : ''}
${context.balance ? `- Balance: $${context.balance}` : ''}
${context.currentPage ? `- Current page: ${context.currentPage}` : ''}
${context.recentTransactions?.length ? `- Recent transactions: ${context.recentTransactions.length}` : ''}

Guidelines:
- Be helpful, concise, and friendly
- Explain crypto concepts in simple terms
- Provide step-by-step guidance when needed
- Never ask for private keys or passwords
- If unsure, direct users to support@africoin.com
- Use the user's context to provide personalized help`;
}

export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your-gemini-api-key-here';
}
