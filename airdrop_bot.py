#!/usr/bin/env python3
"""
Africa Railways Airdrop Announcement Bot

Posts airdrop announcements to the @afrcsentinel Telegram channel.
Supports scheduled posts, manual triggers, and customizable templates.

Usage:
    python airdrop_bot.py --post          # Post default airdrop announcement
    python airdrop_bot.py --schedule      # Run scheduled posting daemon
    python airdrop_bot.py --interactive   # Interactive mode with commands
"""

import os
import sys
import asyncio
import logging
import argparse
from datetime import datetime, timedelta
from typing import Optional
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from telegram.constants import ParseMode
from dotenv import load_dotenv

load_dotenv()

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8524648377:AAFN2HGhkpkEWcuQGf7N1gpEPtItaLN2bJk")
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID", "@afrcsentinel")
ADMIN_IDS = [int(x) for x in os.getenv("TELEGRAM_ADMIN_IDS", "").split(",") if x.strip()]

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Airdrop announcement templates
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

Join: t.me/africarailways

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

🐦 Twitter: twitter.com/africarailways

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
""",

    "custom": """
{content}
"""
}


def get_airdrop_keyboard() -> InlineKeyboardMarkup:
    """Create inline keyboard for airdrop posts."""
    keyboard = [
        [
            InlineKeyboardButton("🎁 Claim Airdrop", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop"),
            InlineKeyboardButton("📊 Check Status", url="https://scroll-waitlist-exchange-1.vercel.app/airdrop")
        ],
        [
            InlineKeyboardButton("🌐 Website", url="https://scroll-waitlist-exchange-1.vercel.app"),
            InlineKeyboardButton("🐦 Twitter", url="https://twitter.com/africarailways")
        ],
        [
            InlineKeyboardButton("💬 Community", url="https://t.me/africarailways")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


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
            # Format with any provided kwargs
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


# Bot command handlers for interactive mode
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ You are not authorized to use this bot.")
        return
    
    await update.message.reply_text(
        "🎁 *Africa Railways Airdrop Bot*\n\n"
        "*Commands:*\n"
        "/post\\_sent - Post SENT airdrop announcement\n"
        "/post\\_afc - Post AFC airdrop announcement\n"
        "/post\\_weekly - Post weekly update\n"
        "/post\\_flash - Post flash airdrop\n"
        "/post\\_referral - Post referral bonus\n"
        "/custom <message> - Post custom message\n"
        "/status - Check bot status\n\n"
        f"*Channel:* {CHANNEL_ID}",
        parse_mode=ParseMode.MARKDOWN
    )


async def cmd_post_sent(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post SENT airdrop announcement."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "sent_airdrop")
    if success:
        await update.message.reply_text("✅ SENT airdrop announcement posted!")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_afc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post AFC airdrop announcement."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "afc_airdrop")
    if success:
        await update.message.reply_text("✅ AFC airdrop announcement posted!")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_weekly(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post weekly update."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "weekly_update")
    if success:
        await update.message.reply_text("✅ Weekly update posted!")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_flash(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post flash airdrop."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "flash_airdrop")
    if success:
        await update.message.reply_text("✅ Flash airdrop posted!")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_post_referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post referral bonus announcement."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    success = await post_to_channel(context.bot, "referral_bonus")
    if success:
        await update.message.reply_text("✅ Referral bonus announcement posted!")
    else:
        await update.message.reply_text("❌ Failed to post announcement")


async def cmd_custom(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Post custom message."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    if not context.args:
        await update.message.reply_text("Usage: /custom <your message>")
        return
    
    custom_message = " ".join(context.args)
    success = await post_to_channel(context.bot, "custom", custom_content=custom_message)
    if success:
        await update.message.reply_text("✅ Custom message posted!")
    else:
        await update.message.reply_text("❌ Failed to post message")


async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Check bot status."""
    user_id = update.effective_user.id
    if ADMIN_IDS and user_id not in ADMIN_IDS:
        await update.message.reply_text("⛔ Unauthorized")
        return
    
    await update.message.reply_text(
        "📊 *Bot Status*\n\n"
        f"✅ Bot: Online\n"
        f"📢 Channel: {CHANNEL_ID}\n"
        f"🔑 Token: ...{BOT_TOKEN[-10:]}\n"
        f"👤 Admins: {len(ADMIN_IDS) if ADMIN_IDS else 'All users'}\n"
        f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        parse_mode=ParseMode.MARKDOWN
    )


async def one_shot_post(template: str = "sent_airdrop"):
    """Post a single announcement and exit."""
    bot = Bot(token=BOT_TOKEN)
    success = await post_to_channel(bot, template)
    if success:
        print(f"✅ Posted {template} announcement to {CHANNEL_ID}")
    else:
        print(f"❌ Failed to post announcement")
        sys.exit(1)


def run_interactive():
    """Run the bot in interactive mode with command handlers."""
    if not BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not set")
        sys.exit(1)
    
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Register handlers
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("post_sent", cmd_post_sent))
    app.add_handler(CommandHandler("post_afc", cmd_post_afc))
    app.add_handler(CommandHandler("post_weekly", cmd_post_weekly))
    app.add_handler(CommandHandler("post_flash", cmd_post_flash))
    app.add_handler(CommandHandler("post_referral", cmd_post_referral))
    app.add_handler(CommandHandler("custom", cmd_custom))
    app.add_handler(CommandHandler("status", cmd_status))
    
    print(f"🎁 Airdrop Bot running...")
    print(f"📢 Channel: {CHANNEL_ID}")
    print(f"🤖 Bot: @AfricaRailwaysBot")
    app.run_polling()


async def run_scheduled(interval_hours: int = 24):
    """Run scheduled posting daemon."""
    bot = Bot(token=BOT_TOKEN)
    print(f"📅 Scheduled posting enabled (every {interval_hours} hours)")
    print(f"📢 Channel: {CHANNEL_ID}")
    
    while True:
        await post_to_channel(bot, "sent_airdrop")
        print(f"⏰ Next post in {interval_hours} hours")
        await asyncio.sleep(interval_hours * 3600)


def main():
    parser = argparse.ArgumentParser(description="Africa Railways Airdrop Bot")
    parser.add_argument("--post", action="store_true", help="Post default airdrop announcement")
    parser.add_argument("--template", type=str, default="sent_airdrop", 
                       choices=list(AIRDROP_TEMPLATES.keys()),
                       help="Template to use for posting")
    parser.add_argument("--schedule", action="store_true", help="Run scheduled posting daemon")
    parser.add_argument("--interval", type=int, default=24, help="Posting interval in hours")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    
    args = parser.parse_args()
    
    if args.post:
        asyncio.run(one_shot_post(args.template))
    elif args.schedule:
        asyncio.run(run_scheduled(args.interval))
    elif args.interactive:
        run_interactive()
    else:
        # Default: run interactive mode
        run_interactive()


if __name__ == "__main__":
    main()
