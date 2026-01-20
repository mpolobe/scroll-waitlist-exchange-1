// Telegram Bot API service for posting messages from the website
// Bot: @AfricaRailwaysBot
// Group: @afrcsentinel

const BOT_TOKEN = '8524648377:AAFN2HGhkpkEWcuQGf7N1gpEPtItaLN2bJk';
const CHAT_ID = '@afrcsentinel';

export interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: { id: number; title: string };
    date: number;
    text: string;
  };
  description?: string;
}

export interface PostOptions {
  parseMode?: 'Markdown' | 'HTML';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

// Message templates for quick posting
export const MESSAGE_TEMPLATES = {
  ido_live: `🚂 *$SENT Token IDO is LIVE on PinkSale!*

🌍 Building Africa's railway safety infrastructure
✅ Audited Contract
✅ Locked Liquidity  
✅ Real Utility - 2,000+ track workers

🔗 Join now: [PinkSale Launchpad](https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08)

#SENT #PinkSale #Polygon #Crypto`,

  countdown: `⏰ *SENT IDO Countdown!*

🚀 Don't miss the opportunity!
📅 IDO is live NOW on PinkSale

🔗 Participate: [PinkSale](https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08)

#SENT #IDO #Crypto`,

  ecosystem: `🌍 *Africa Railways Ecosystem*

🔹 *$AFC* - Payment token on Sui
🔹 *$SENT* - Governance token on Polygon  
🔹 Real utility with railway integration

🌐 Website: [africarailways.com](https://africarailways.com)
📊 Reviews: [Project Reviews](https://africarailways.com/reviews)

#AfricaRailways #Crypto #DeFi #RWA`,

  why_sent: `💡 *Why $SENT is a gem:*

1️⃣ Real utility - 2,000+ railway workers
2️⃣ Proof-of-Safety consensus
3️⃣ Audited & verified on PinkSale
4️⃣ Low market cap opportunity
5️⃣ Strong roadmap through 2026

📖 DYOR: [Read Full Review](https://africarailways.com/reviews/sent-token-sentinel-network)

#SENT #CryptoGems`,

  afc_token: `🚀 *Africoin ($AFC) - Live on Sui Mainnet!*

💰 Pan-African payment token
⚡ Fast & cheap transactions
🎫 Railway ticket purchases
🏪 Merchant payments

🔗 Buy AFC: [MovePump](https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC)

#AFC #Sui #Crypto #Africa`,

  daily_reminder: `⏰ *Daily Reminder: SENT IDO is live!*

🛡️ Sentinel Network - Railway Safety Token
📈 Join early for best allocation

👉 [Participate Now](https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08)

#SENT #PinkSale #Polygon`,
};

export type TemplateKey = keyof typeof MESSAGE_TEMPLATES;

/**
 * Post a message to the Telegram group
 */
export async function postToTelegram(
  message: string,
  options: PostOptions = {}
): Promise<TelegramResponse> {
  const { parseMode = 'Markdown', disableWebPagePreview = false, disableNotification = false } = options;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
      disable_notification: disableNotification,
    }),
  });

  return response.json();
}

/**
 * Post a template message to Telegram
 */
export async function postTemplate(
  templateKey: TemplateKey,
  options: PostOptions = {}
): Promise<TelegramResponse> {
  const message = MESSAGE_TEMPLATES[templateKey];
  return postToTelegram(message, options);
}

/**
 * Get bot info to verify connection
 */
export async function getBotInfo(): Promise<{ ok: boolean; result?: { username: string; first_name: string } }> {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  return response.json();
}

/**
 * Get chat info to verify group access
 */
export async function getChatInfo(): Promise<{ ok: boolean; result?: { id: number; title: string; type: string } }> {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID }),
  });
  return response.json();
}
