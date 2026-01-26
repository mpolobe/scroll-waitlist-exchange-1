#!/usr/bin/env python3
"""
Africa Railways Unified Telegram Bot (@AfricaRailwaysBot)

Features:
- Promotional content and community links
- Airdrop announcements to @afrcsentinel channel
- Sui network status and contract info
- Referral and promoter programs

Usage:
    python afc_bot.py                    # Run interactive bot
    python afc_bot.py --post sent        # Post SENT airdrop to channel
    python afc_bot.py --post afc         # Post AFC airdrop to channel
    python afc_bot.py --schedule 24      # Run scheduled posting (every 24h)
"""

import os
import sys
import asyncio
import logging
import argparse
from datetime import datetime, timedelta
from typing import Optional
import requests
from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler
from telegram.constants import ParseMode
from dotenv import load_dotenv

load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8524648377:AAFN2HGhkpkEWcuQGf7N1gpEPtItaLN2bJk")
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID", "@afrcsentinel")
AFC_PACKAGE_ID = os.getenv("AFC_PACKAGE_ID", "0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8")
SUI_RPC_URL = os.getenv("SUI_RPC_URL", "https://fullnode.mainnet.sui.io:443")
ADMIN_IDS = [int(x) for x in os.getenv("TELEGRAM_ADMIN_IDS", "").split(",") if x.strip()]

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# =============================================================================
# PROMOTIONAL CONTENT TEMPLATES
# =============================================================================

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

🌐 Website: [Africa Railways](https://scroll-waitlist-exchange-1.vercel.app)
📊 Reviews: [Project Reviews](https://scroll-waitlist-exchange-1.vercel.app/reviews)

#AfricaRailways #Crypto #DeFi #RWA""",

    'why_sent': """💡 *Why $SENT is a gem:*

1️⃣ Real utility - 2,000+ railway workers
2️⃣ Proof-of-Safety consensus
3️⃣ Audited & verified on PinkSale
4️⃣ Low market cap opportunity
5️⃣ Strong roadmap through 2026

📖 DYOR: [Read Full Review](https://scroll-waitlist-exchange-1.vercel.app/reviews/sent-token-sentinel-network)

#SENT #CryptoGems""",

    'afc': """🚀 *Africoin ($AFC) - Live on Sui Mainnet!*

💰 Pan-African payment token
⚡ Fast & cheap transactions
🎫 Railway ticket purchases
🏪 Merchant payments

🔗 Buy AFC: [MovePump](https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC)

#AFC #Sui #Crypto #Africa"""
}

# =============================================================================
# AIRDROP ANNOUNCEMENT TEMPLATES
# =============================================================================

AIRDROP_TEMPLATES = {
    "sent_airdrop": """
🎁 *$SENT TOKEN AIRDROP IS LIVE!*

🚂 Africa Railways is rewarding early supporters!

*How to Claim:*
1️⃣ Complete the quiz at the airdrop page
2️⃣ Score 70%+ to qualify
3️⃣ Connect your Polygon wallet
4️⃣ Claim your $SENT tokens!

*Rewards:*
• 70-79% score: 50 SENT
• 80-89% score: 100 SENT
• 90-100% score: 200 SENT

⏰ *Limited Time Only!*

🔗 Claim Now: [Airdrop Page](https://scroll-waitlist-exchange-1.vercel.app/airdrop)

#SENT #Airdrop #Polygon #AfricaRailways
""",

    "afc_airdrop": """
🚀 *$AFC AIRDROP ANNOUNCEMENT*

💰 Africoin ($AFC) rewards for the community!

*Eligibility:*
✅ Hold 100+ SENT tokens
✅ Follow @africarailways on Twitter
✅ Join our Telegram community
✅ Complete KYC verification

*Distribution:*
📅 Snapshot: End of month
📊 Amount: Based on SENT holdings
🔗 Network: Sui Mainnet

Register: [Airdrop Page](https://scroll-waitlist-exchange-1.vercel.app/airdrop)

#AFC #Sui #Airdrop #Crypto
""",

    "weekly_update": """
📢 *WEEKLY AIRDROP UPDATE*

🗓️ Week of {date}

*Active Airdrops:*
🎁 $SENT Quiz Airdrop - LIVE
🎁 $AFC Holder Rewards - Coming Soon

*Completed Claims This Week:*
👥 {claims} successful claims
💰 {tokens} SENT distributed

*Next Airdrop:*
📅 {next_date}
🎯 Stay tuned for details!

Join: t.me/afrcsentinel

#AfricaRailways #Airdrop #Crypto
""",

    "flash_airdrop": """
⚡ *FLASH AIRDROP - 24 HOURS ONLY!*

🎯 Quick rewards for fast movers!

*Task:*
1️⃣ Retweet our pinned post
2️⃣ Tag 3 friends
3️⃣ Drop your Polygon address below

*Reward:* 25 SENT per participant
*Limit:* First 500 participants

⏰ Ends: {end_time}

🐦 Twitter: x.com/africoin_afc

#FlashAirdrop #SENT #Crypto
""",

    "referral_bonus": """
🤝 *REFERRAL AIRDROP BONUS*

Invite friends, earn more $SENT!

*How it works:*
📨 Share your unique referral link
✅ Friend completes quiz airdrop
💰 You both get +50 SENT bonus!

*Leaderboard Rewards:*
🥇 Top Referrer: 1,000 SENT
🥈 2nd Place: 500 SENT
🥉 3rd Place: 250 SENT

Get your link: [Airdrop Page](https://scroll-waitlist-exchange-1.vercel.app/airdrop)

#Referral #SENT #Airdrop
"""
}

# =============================================================================
# KEYBOARD HELPERS
# =============================================================================

def get_main_keyboard() -> InlineKeyboardMarkup:
    """Main menu keyboard."""
    keyboard = [
        [InlineKeyboardButton("🛡️ SENT IDO", url="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08")],
        [InlineKeyboardButton("🚀 Buy AFC", url="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC")],
        [InlineKeyboardButton("🎁 Airdrop", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop")],
        [InlineKeyboardButton("🌐 Website", url="https://scroll-waitlist-exchange-1.vercel.app"), 
         InlineKeyboardButton("📊 Reviews", url="https://scroll-waitlist-exchange-1.vercel.app/reviews")],
    ]
    return InlineKeyboardMarkup(keyboard)


def get_airdrop_keyboard() -> InlineKeyboardMarkup:
    """Airdrop announcement keyboard."""
    keyboard = [
        [
            InlineKeyboardButton("🎁 Claim Airdrop", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop"),
            InlineKeyboardButton("📊 Check Status", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop")
        ],
        [
            InlineKeyboardButton("🌐 Website", url="https://scroll-waitlist-exchange-1.vercel.app"),
            InlineKeyboardButton("🐦 Twitter", url="https://x.com/africoin_afc")
        ],
        [
            InlineKeyboardButton("💬 Community", url="https://t.me/afrcsentinel")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


# =============================================================================
# CORE BOT COMMANDS
# =============================================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome message with all available commands."""
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "🌍 *Africa Railways - Official Bot*\n\n"
            "Welcome to Africa's premier crypto ecosystem!\n\n"
            "*📋 Info Commands:*\n"
            "/status - Sui Network Status\n"
            "/contract - AFC Contract Details\n"
            "/audit - Transparency Reports\n"
            "/stats - Community Stats\n"
            "/links - All Important Links\n\n"
            "*📢 Promo Commands:*\n"
            "/promo - Get Shareable Content\n"
            "/promoter - Become a Promoter\n\n"
            "*🎁 Airdrop Commands (Admin):*\n"
            "/post\\_sent - Post SENT Airdrop\n"
            "/post\\_afc - Post AFC Airdrop\n"
            "/post\\_flash - Post Flash Airdrop\n"
            "/post\\_referral - Post Referral Bonus\n"
            "/post\\_weekly - Post Weekly Update\n"
            "/custom <msg> - Post Custom Message"
        ),
        reply_markup=get_main_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check Sui network connection."""
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
            status_text = f"✅ *Sui Mainnet Connected*\nChain ID: `{chain_id}`\nRPC: `{SUI_RPC_URL}`"
        else:
            status_text = f"⚠️ *Connection Issue*\nRPC responded with status {response.status_code}"
            
    except Exception as e:
        status_text = f"❌ *Error Connecting to Sui*\n{str(e)}"

    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=status_text,
        parse_mode=ParseMode.MARKDOWN
    )


async def contract(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Display AFC contract information."""
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            f"📜 *AFC Token Contract Details*\n\n"
            f"*Package ID:* `{AFC_PACKAGE_ID}`\n"
            f"*Network:* Sui Mainnet\n\n"
            f"View on Explorer: [SuiVision](https://suivision.xyz/package/{AFC_PACKAGE_ID})"
        ),
        parse_mode=ParseMode.MARKDOWN
    )


async def audit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Provide audit and transparency info."""
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "🔍 *Transparency & Audit Logs*\n\n"
            "All transactions and reserves are verifiable on-chain.\n"
            "Institutional reports are generated daily."
        ),
        parse_mode=ParseMode.MARKDOWN
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
        parse_mode=ParseMode.MARKDOWN
    )


async def links(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send all important links."""
    keyboard = [
        [
            InlineKeyboardButton("🌐 Website", url="https://scroll-waitlist-exchange-1.vercel.app"),
            InlineKeyboardButton("📊 Reviews", url="https://scroll-waitlist-exchange-1.vercel.app/reviews")
        ],
        [
            InlineKeyboardButton("🎁 Airdrop", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop"),
            InlineKeyboardButton("🛡️ SENT IDO", url="https://www.pinksale.finance/launchpad/polygon/0xf366e3aaCC54C99E50c90B7C57625776f88D8d08")
        ],
        [
            InlineKeyboardButton("🚀 Buy AFC", url="https://movepump.com/token/0xc68c4cfb63d702227db09c28837e75abd23bbb3adc192e3bc45fecca4dd5b7e8::afc::AFC")
        ],
        [
            InlineKeyboardButton("🐦 Twitter", url="https://x.com/africoin_afc"),
            InlineKeyboardButton("📱 Telegram", url="https://t.me/afrcsentinel")
        ],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔗 *Africa Railways - Quick Links*\n\n"
        "Access all our platforms and resources:",
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )


# =============================================================================
# PROMO COMMANDS
# =============================================================================

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
        parse_mode=ParseMode.MARKDOWN
    )


async def promo_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle promotional content selection."""
    query = update.callback_query
    await query.answer()
    
    promo_type = query.data.replace('promo_', '')
    content = PROMO_TEMPLATES.get(promo_type, PROMO_TEMPLATES['ecosystem'])
    
    await query.message.reply_text(
        content,
        parse_mode=ParseMode.MARKDOWN,
        disable_web_page_preview=True
    )
    
    await query.message.reply_text(
        "👆 *Copy and share this content!*\n\n"
        "📱 Share on Twitter, Telegram, Discord, Reddit",
        parse_mode=ParseMode.MARKDOWN
    )


async def promoter_info(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Information about becoming a promoter."""
    keyboard = [
        [InlineKeyboardButton("📱 Join Telegram", url="https://t.me/afrcsentinel")],
        [InlineKeyboardButton("🌐 Website", url="https://scroll-waitlist-exchange-1.vercel.app")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🎯 *Become an Africa Railways Promoter*\n\n"
        "*Tiers:*\n"
        "🥉 *Bronze* - 100+ followers\n"
        "   • Promotional materials\n"
        "   • Weekly SENT airdrops\n\n"
        "🥈 *Silver* - 1,000+ followers\n"
        "   • Exclusive alpha access\n"
        "   • Monthly SENT bonus\n\n"
        "🥇 *Gold* - 10,000+ followers\n"
        "   • Revenue share program\n"
        "   • Featured on website\n\n"
        "_DM an admin to apply!_",
        reply_markup=reply_markup,
        parse_mode=ParseMode.MARKDOWN
    )


# =============================================================================
# AIRDROP CHANNEL POSTING COMMANDS
# =============================================================================

def is_admin(user_id: int) -> bool:
    """Check if user is admin (empty list = all users allowed)."""
    return not ADMIN_IDS or user_id in ADMIN_IDS


async def post_to_channel(
    bot: Bot,
    template_name: str = "sent_airdrop",
    custom_content: Optional[str] = None,
    **kwargs
) -> bool:
    """Post an airdrop announcement to the channel."""
    try:
        if template_name == "custom" and custom_content:
            message = custom_content
        else:
            template = AIRDROP_TEMPLATES.get(template_name, AIRDROP_TEMPLATES["sent_airdrop"])
            message = template.format(
                date=kwargs.get("date", datetime.now().strftime("%B %d, %Y")),
                claims=kwargs.get("claims", "150+"),
                tokens=kwargs.get("tokens", "15,000"),
                next_date=kwargs.get("next_date", "TBA"),
                end_time=kwargs.get("end_time", (datetime.now() + timedelta(hours=24)).strftime("%B %d, %H:%M UTC")),
                content=custom_content or ""
            )
        
        await bot.send_message(
            chat_id=CHANNEL_ID,
            text=message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=get_airdrop_keyboard(),
            disable_web_page_preview=True
        )
        logger.info(f"Posted {template_name} announcement to {CHANNEL_ID}")
        return True
    except Exception as e:
        logger.error(f"Failed to post to channel: {e}")
        return False


async def cmd_post_sent(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post SENT airdrop announcement to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "sent_airdrop")
    if success:
        await update.message.reply_text(f"✅ SENT airdrop posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_afc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post AFC airdrop announcement to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "afc_airdrop")
    if success:
        await update.message.reply_text(f"✅ AFC airdrop posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_weekly(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post weekly update to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "weekly_update")
    if success:
        await update.message.reply_text(f"✅ Weekly update posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_flash(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post flash airdrop to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "flash_airdrop")
    if success:
        await update.message.reply_text(f"✅ Flash airdrop posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post referral bonus announcement to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "referral_bonus")
    if success:
        await update.message.reply_text(f"✅ Referral bonus posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_custom(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post custom message to channel."""
    if not is_admin(update.effective_user.id):
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    if not context.args:
        await update.message.reply_text("Usage: /custom <your message>")
        return
    
    custom_message = " ".join(context.args)
    success = await post_to_channel(context.bot, "custom", custom_content=custom_message)
    if success:
        await update.message.reply_text(f"✅ Custom message posted to {CHANNEL_ID}")
    else:
        await update.message.reply_text("❌ Failed to post message")


# =============================================================================
# CLI FUNCTIONS
# =============================================================================

async def one_shot_post(template: str = "sent_airdrop"):
    """Post a single announcement and exit."""
    bot = Bot(token=BOT_TOKEN)
    success = await post_to_channel(bot, template)
    if success:
        print(f"✅ Posted {template} announcement to {CHANNEL_ID}")
    else:
        print(f"❌ Failed to post announcement")
        sys.exit(1)


async def run_scheduled(interval_hours: int = 24):
    """Run scheduled posting daemon."""
    bot = Bot(token=BOT_TOKEN)
    print(f"📅 Scheduled posting enabled (every {interval_hours} hours)")
    print(f"📢 Channel: {CHANNEL_ID}")
    
    while True:
        await post_to_channel(bot, "sent_airdrop")
        print(f"⏰ Next post in {interval_hours} hours")
        await asyncio.sleep(interval_hours * 3600)


def run_bot():
    """Run the interactive bot."""
    if not BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not set")
        sys.exit(1)
    
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Core commands
    app.add_handler(CommandHandler('start', start))
    app.add_handler(CommandHandler('status', status))
    app.add_handler(CommandHandler('contract', contract))
    app.add_handler(CommandHandler('audit', audit))
    app.add_handler(CommandHandler('stats', stats))
    app.add_handler(CommandHandler('links', links))
    
    # Promo commands
    app.add_handler(CommandHandler('promo', promo))
    app.add_handler(CommandHandler('promoter', promoter_info))
    app.add_handler(CallbackQueryHandler(promo_callback, pattern='^promo_'))
    
    # Airdrop posting commands
    app.add_handler(CommandHandler('post_sent', cmd_post_sent))
    app.add_handler(CommandHandler('post_afc', cmd_post_afc))
    app.add_handler(CommandHandler('post_weekly', cmd_post_weekly))
    app.add_handler(CommandHandler('post_flash', cmd_post_flash))
    app.add_handler(CommandHandler('post_referral', cmd_post_referral))
    app.add_handler(CommandHandler('custom', cmd_custom))
    
    print("🌍 Africa Railways Bot is running...")
    print(f"🤖 Bot: @AfricaRailwaysBot")
    print(f"📢 Channel: {CHANNEL_ID}")
    app.run_polling()


def main():
    parser = argparse.ArgumentParser(description="Africa Railways Telegram Bot")
    parser.add_argument("--post", type=str, metavar="TEMPLATE",
                       choices=["sent", "afc", "weekly", "flash", "referral"],
                       help="Post announcement to channel and exit")
    parser.add_argument("--schedule", type=int, metavar="HOURS",
                       help="Run scheduled posting every N hours")
    
    args = parser.parse_args()
    
    if args.post:
        template_map = {
            "sent": "sent_airdrop",
            "afc": "afc_airdrop", 
            "weekly": "weekly_update",
            "flash": "flash_airdrop",
            "referral": "referral_bonus"
        }
        asyncio.run(one_shot_post(template_map[args.post]))
    elif args.schedule:
        asyncio.run(run_scheduled(args.schedule))
    else:
        run_bot()


if __name__ == "__main__":
    main()
