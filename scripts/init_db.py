import sqlite3
import os

def init_db():
    # Create the database in the root folder
    db_path = os.path.join(os.getcwd(), 'railways.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Table to link Phone Numbers to Sui Wallets
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (phone_number TEXT PRIMARY KEY, sui_address TEXT, mnemonic TEXT)''')
    
    # 260966165444 is the Master Visionary (You)
    # We pre-link your existing wallet from the MovePump launch
    master_wallet = "0x4284dee31121675fce54b211eddf0eb786ed5d6880b8ec728d2c0a3cc104e3c8"
    c.execute("INSERT OR REPLACE INTO users (phone_number, sui_address) VALUES (?, ?)", 
              ("+260966165444", master_wallet))
    
    conn.commit()
    conn.close()
    print(f"✅ Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
