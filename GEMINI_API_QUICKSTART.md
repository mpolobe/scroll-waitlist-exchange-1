# Gemini API Quick Start

Quick reference for Gemini AI integration in Africoin Wallet.

## API Key

**Project:** AfriCoin-Sovereign-Key  
**Project Number:** 5780586642  
**API Key:** `AIzaSyAqJaTc_LubzhXsohzA8Qi4PyQ-LtNPrhc`

---

## Setup (Choose One)

### Option 1: Automated

```bash
export CODEMAGIC_API_TOKEN="your_token"
export CODEMAGIC_APP_ID="your_app_id"
./setup-gemini-api.sh
```

### Option 2: Manual

**Codemagic:**
- Group: `africoin_env_vars`
- Variable: `VITE_GEMINI_API_KEY`
- Value: `AIzaSyAqJaTc_LubzhXsohzA8Qi4PyQ-LtNPrhc`
- Secure: ✅

**GitHub:**
- Secret: `VITE_GEMINI_API_KEY`
- Value: `AIzaSyAqJaTc_LubzhXsohzA8Qi4PyQ-LtNPrhc`

**Local:**
```bash
echo "VITE_GEMINI_API_KEY=AIzaSyAqJaTc_LubzhXsohzA8Qi4PyQ-LtNPrhc" >> .env.local
```

---

## Test

```bash
# Start dev server
npm run dev

# Open app → Click AI Assistant icon
# Send message: "How do I send AFC tokens?"
```

---

## Features

✅ AI-powered customer support  
✅ Wallet assistance  
✅ Blockchain explanations  
✅ Railway booking help  
✅ Security guidance  
✅ 24/7 support

---

## Usage

```typescript
// src/lib/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function chat(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(message);
  return result.response.text();
}
```

---

## Resources

- [Full Guide](./GEMINI_INTEGRATION.md)
- [API Docs](https://ai.google.dev/docs)
- [Console](https://console.cloud.google.com/apis/dashboard?project=5780586642)

---

**Status:** Ready to use  
**Model:** gemini-pro  
**Quota:** 60 req/min, 1.5k req/day
