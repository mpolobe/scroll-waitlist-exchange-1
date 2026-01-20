import os
import logging
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
AFC_PACKAGE_ID = os.getenv("AFC_PACKAGE_ID")
SUI_RPC_URL = os.getenv("SUI_RPC_URL")

# Logging setup
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Promotional content templates
PROMO_TEMPLATES = {
    'ido': """🚂 *$SENT Token IDO is LIVE on PinkSale!*

🌍 Building Africa's railway safety infrastructure
✅ Audited Contract
✅ Locked Liquidity  
✅ Real Utility - 2,000+ track workers

🔗 Join now: [PinkSale Launchpad](https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08)

#SENT #PinkSale #Polygon #Crypto""",

    'ecosystem': """🌍 *Africa Railways Ecosystem*

🔹 *$AFC* - Payment token on Sui
🔹 *$SENT* - Governance token on Polygon  
🔹 Real utility with railway integration

🌐 Website: [africarailways.com](https://africarailways.com)
📊 Reviews: [Project Reviews](https://africarailways.com/reviews)

#AfricaRailways #Crypto #DeFi #RWA""",

    'why_sent': """💡 *Why $SENT is a gem:*

1️⃣ Real utility - 2,000+ railway workers
2️⃣ Proof-of-Safety consensus
3️⃣ Audited & verified on PinkSale
4️⃣ Low market cap opportunity
5️⃣ Strong roadmap through 2026

📖 DYOR: [Read Full Review](https://africarailways.com/reviews/sent-token-sentinel-network)

#SENT #CryptoGems""",

    'afc': """🚀 *Africoin ($AFC) - Live on Sui Mainnet!*

💰 Pan-African payment token
⚡ Fast & cheap transactions
🎫 Railway ticket purchases
🏪 Merchant payments

🔗 Buy AFC: [MovePump](https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC)

#AFC #Sui #Crypto #Africa"""
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Sends a welcome message."""
    keyboard = [
        [InlineKeyboardButton("🛡️ SENT IDO", url="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08")],
        [InlineKeyboardButton("🚀 Buy AFC", url="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC")],
        [InlineKeyboardButton("🌐 Website", url="https://africarailways.com"), InlineKeyboardButton("📊 Reviews", url="https://africarailways.com/reviews")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "🌍 **Africa Railways - Official Bot**\n\n"
            "Welcome to Africa's premier crypto research platform!\n\n"
            "**Quick Commands:**\n"
            "/status - Check Sui Network Status\n"
            "/contract - View AFC Contract Details\n"
            "/audit - View Transparency Reports\n"
            "/promo - Get promotional content\n"
            "/links - All important links\n"
            "/stats - Community stats\n"
            "/promoter - Become a promoter"
        ),
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Checks connection to Sui RPC."""
    try:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sui_getChainIdentifier",
            "params": []
        }
        response = requests.post(SUI_RPC_URL, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            chain_id = data.get("result", "Unknown")
            status_text = f"✅ **Sui Mainnet Connected**\nChain ID: `{chain_id}`\nRPC: `{SUI_RPC_URL}`"
        else:
            status_text = f"⚠️ **Connection Issue**\nRPC responded with status {response.status_code}"
            
    except Exception as e:
        status_text = f"❌ **Error Connecting to Sui**\n{str(e)}"

    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=status_text,
        parse_mode='Markdown'
    )

async def contract(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Displays contract information."""
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            f"📜 **AFC Token Contract Details**\n\n"
            f"**Package ID:** `{AFC_PACKAGE_ID}`\n"
            f"**Network:** Sui Mainnet\n\n"
            f"View on Explorer: [SuiVision](https://suivision.xyz/package/{AFC_PACKAGE_ID})"
        ),
        parse_mode='Markdown'
    )

async def audit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Provides audit and transparency info."""
    # Placeholder for actual audit links or file serving
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "🔍 **Transparency & Audit Logs**\n\n"
            "All transactions and reserves are verifiable on-chain.\n"
            "Institutional reports are generated daily."
        ),
        parse_mode='Markdown'
    )

async def promo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send promotional content menu."""
    keyboard = [
        [InlineKeyboardButton("🛡️ SENT IDO", callback_data='promo_ido')],
        [InlineKeyboardButton("🌍 Ecosystem Overview", callback_data='promo_ecosystem')],
        [InlineKeyboardButton("💡 Why SENT", callback_data='promo_why_sent')],
        [InlineKeyboardButton("🚀 AFC Token", callback_data='promo_afc')],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "📢 **Promotional Content**\n\n"
        "Select content to share with your community:\n\n"
        "_Click a button to get shareable content_",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def promo_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle promotional content selection."""
    query = update.callback_query
    await query.answer()
    
    promo_type = query.data.replace('promo_', '')
    content = PROMO_TEMPLATES.get(promo_type, PROMO_TEMPLATES['ecosystem'])
    
    await query.message.reply_text(
        content,
        parse_mode='Markdown',
        disable_web_page_preview=True
    )
    
    await query.message.reply_text(
        "👆 **Copy and share this content!**\n\n"
        "📱 Share on Twitter, Telegram, Discord, Reddit",
        parse_mode='Markdown'
    )

async def links(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send all important links."""
    keyboard = [
        [
            InlineKeyboardButton("🌐 Website", url="https://africarailways.com"),
            InlineKeyboardButton("📊 Reviews", url="https://africarailways.com/reviews")
        ],
        [
            InlineKeyboardButton("🛡️ SENT IDO", url="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08"),
            InlineKeyboardButton("🚀 Buy AFC", url="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC")
        ],
        [
            InlineKeyboardButton("🐦 Twitter", url="https://twitter.com/africarailways"),
            InlineKeyboardButton("📱 Telegram", url="https://t.me/africarailways")
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔗 **Africa Railways - Quick Links**\n\n"
        "Access all our platforms and resources:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show community and project stats."""
    await update.message.reply_text(
        "📊 **Africa Railways Stats**\n\n"
        "**Community:**\n"
        "👥 Members: 25,000+\n"
        "🌍 Countries: 45+\n"
        "📢 Promoters: 150+\n\n"
        "**$SENT Token:**\n"
        "🔗 Network: Polygon\n"
        "📈 Status: IDO Live\n"
        "🔒 Liquidity: Locked\n"
        "✅ Audit: Passed\n\n"
        "**$AFC Token:**\n"
        "🔗 Network: Sui\n"
        "📈 Status: Live\n"
        "💰 Market Cap: Growing\n\n"
        "_Stats updated regularly_",
        parse_mode='Markdown'
    )

async def promoter_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Information about becoming a promoter."""
    keyboard = [
        [InlineKeyboardButton("📱 Join Telegram", url="https://t.me/africarailways")],
        [InlineKeyboardButton("🌐 Promoter Hub", url="https://africarailways.com/promoter")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🎯 **Become an Africa Railways Promoter**\n\n"
        "**Tiers:**\n"
        "🥉 **Bronze** - 100+ followers\n"
        "   • Promotional materials\n"
        "   • Weekly SENT airdrops\n\n"
        "🥈 **Silver** - 1,000+ followers\n"
        "   • Exclusive alpha access\n"
        "   • Monthly SENT bonus\n\n"
        "🥇 **Gold** - 10,000+ followers\n"
        "   • Revenue share program\n"
        "   • Featured on website\n\n"
        "_DM an admin to apply!_",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

if __name__ == '__main__':
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN is missing in .env")
        exit(1)
        
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Core commands
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('status', status))
    application.add_handler(CommandHandler('contract', contract))
    application.add_handler(CommandHandler('audit', audit))
    
    # Marketing commands
    application.add_handler(CommandHandler('promo', promo))
    application.add_handler(CommandHandler('links', links))
    application.add_handler(CommandHandler('stats', stats))
    application.add_handler(CommandHandler('promoter', promoter_info))
    
    # Callback handlers
    application.add_handler(CallbackQueryHandler(promo_callback, pattern='^promo_'))
    
    print("Bot is running with marketing features...")
    application.run_polling()
