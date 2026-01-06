import os
import logging
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler
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

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Sends a welcome message."""
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "🌍 **Africoin ($AFC) Institutional Bot**\n\n"
            "Welcome to the official transparency interface for Africoin on Sui Mainnet.\n"
            "Commands:\n"
            "/status - Check Sui Network Status\n"
            "/contract - View AFC Contract Details\n"
            "/audit - View Transparency Reports"
        ),
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

if __name__ == '__main__':
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN is missing in .env")
        exit(1)
        
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('status', status))
    application.add_handler(CommandHandler('contract', contract))
    application.add_handler(CommandHandler('audit', audit))
    
    print("Bot is running...")
    application.run_polling()
