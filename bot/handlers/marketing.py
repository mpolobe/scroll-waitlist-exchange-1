"""
Marketing and promotional handlers for the Africa Railways Telegram bot.
Provides commands for sharing promotional content, tracking referrals, and community engagement.
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

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

    'why_sent': """💡 *Why I'm bullish on $SENT:*

1️⃣ Real utility - 2,000+ railway workers
2️⃣ Proof-of-Safety consensus
3️⃣ Audited & verified on PinkSale
4️⃣ Low market cap gem
5️⃣ Strong roadmap through 2026

📖 DYOR: [Read Full Review](https://africarailways.com/reviews/sent-token-sentinel-network)

#SENT #CryptoGems #100xGem""",

    'afc': """🚀 *Africoin ($AFC) - Live on Sui Mainnet!*

💰 Pan-African payment token
⚡ Fast & cheap transactions
🎫 Railway ticket purchases
🏪 Merchant payments

🔗 Buy AFC: [MovePump](https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC)

#AFC #Sui #Crypto #Africa"""
}

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
        "📢 *Promotional Content*\n\n"
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
    
    # Send the promotional content
    await query.message.reply_text(
        content,
        parse_mode='Markdown',
        disable_web_page_preview=True
    )
    
    # Send share instructions
    await query.message.reply_text(
        "👆 *Copy and share this content!*\n\n"
        "📱 Share on:\n"
        "• Twitter/X\n"
        "• Telegram groups\n"
        "• Discord servers\n"
        "• Reddit communities\n\n"
        "_Remember to follow community guidelines when sharing_",
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
        [
            InlineKeyboardButton("📈 DEXView", url="https://dexview.com"),
            InlineKeyboardButton("🔒 PinkSale", url="https://www.pinksale.finance")
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔗 *Africa Railways - Quick Links*\n\n"
        "Access all our platforms and resources:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Generate referral information."""
    user = update.effective_user
    referral_link = f"https://africarailways.com?ref={user.id}"
    
    await update.message.reply_text(
        f"🎁 *Your Referral Program*\n\n"
        f"Share Africa Railways and earn rewards!\n\n"
        f"📎 Your referral link:\n`{referral_link}`\n\n"
        f"*How it works:*\n"
        f"1️⃣ Share your link with friends\n"
        f"2️⃣ They sign up and participate in IDOs\n"
        f"3️⃣ You earn SENT token rewards\n\n"
        f"_Referral tracking coming soon!_",
        parse_mode='Markdown'
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show community and project stats."""
    await update.message.reply_text(
        "📊 *Africa Railways Stats*\n\n"
        "*Community:*\n"
        "👥 Members: 25,000+\n"
        "🌍 Countries: 45+\n"
        "📢 Promoters: 150+\n\n"
        "*$SENT Token:*\n"
        "🔗 Network: Polygon\n"
        "📈 Status: IDO Live\n"
        "🔒 Liquidity: Locked\n"
        "✅ Audit: Passed\n\n"
        "*$AFC Token:*\n"
        "🔗 Network: Sui\n"
        "📈 Status: Live\n"
        "💰 Market Cap: Growing\n\n"
        "_Stats updated regularly_",
        parse_mode='Markdown'
    )

async def help_marketing(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show marketing-related help."""
    await update.message.reply_text(
        "📢 *Marketing Commands*\n\n"
        "/promo - Get shareable promotional content\n"
        "/links - All important links\n"
        "/referral - Your referral link\n"
        "/stats - Community & project stats\n"
        "/promoter - Become a promoter\n\n"
        "*General Commands:*\n"
        "/start - Welcome message\n"
        "/price - AFC market data\n"
        "/treasury - Proof of reserves\n"
        "/contract - Contract details\n"
        "/audit - Audit information\n\n"
        "_Join our promoter program for rewards!_",
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
        "🎯 *Become an Africa Railways Promoter*\n\n"
        "*Tiers:*\n"
        "🥉 *Bronze* - 100+ followers\n"
        "   • Promotional materials\n"
        "   • Community badge\n"
        "   • Weekly SENT airdrops\n\n"
        "🥈 *Silver* - 1,000+ followers\n"
        "   • All Bronze benefits\n"
        "   • Exclusive alpha access\n"
        "   • Monthly SENT bonus\n\n"
        "🥇 *Gold* - 10,000+ followers\n"
        "   • All Silver benefits\n"
        "   • Revenue share program\n"
        "   • Featured on website\n"
        "   • AMA hosting opportunities\n\n"
        "_DM an admin to apply!_",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )
