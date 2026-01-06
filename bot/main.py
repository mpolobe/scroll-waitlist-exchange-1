import os
from telegram.ext import ApplicationBuilder, CommandHandler
from bot.handlers.commands import start, price, revenue, treasury
from dotenv import load_dotenv

load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    # Using the token from your screenshot: 8247242422:AA...
    if not token:
        print("❌ Error: TELEGRAM_BOT_TOKEN not found in .env file.")
        return

    app = ApplicationBuilder().token(token).build()

    # Financial Handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("price", price))
    app.add_handler(CommandHandler("revenue", revenue))
    app.add_handler(CommandHandler("treasury", treasury))

    print("🏛 Institutional Terminal is Online...")
    app.run_polling()

if __name__ == "__main__":
    main()
