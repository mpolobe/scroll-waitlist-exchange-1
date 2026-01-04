# How to Get Famous-AI Supabase Key

## Option 1: Famous-AI Dashboard
1. Go to: https://famous.ai/project/6928d753085881c25b2cb3fb/s
2. Navigate to: **Settings** → **Environment Variables** or **Secrets**
3. Look for variables like:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_KEY`
   - `SUPABASE_ANON_KEY`
4. Copy the service_role key (NOT the anon key)

## Option 2: Famous-AI Database Settings
1. In your Famous-AI project dashboard
2. Go to: **Database** → **Settings** → **API**
3. Find the "API Keys" section
4. Copy the **service_role** key

## Option 3: Check Project Configuration Files
Look in your Famous-AI project for files like:
- `.env`
- `.env.local`
- `supabase/config.toml`
- Famous-AI project settings

## Option 4: Contact Famous-AI Support
If you can't find the keys, contact Famous-AI support with your:
- Project ID: ecfg_ujao07pswlsvzhjbhqtd0fnos9l9
- They can help retrieve your Supabase credentials

## What You Need
For the migration to work, you need the **service_role** key that looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Once you have it, run:
```bash
export FAMOUS_AI_SUPABASE_KEY='your-service-role-key'
bash run-migration.sh
```
