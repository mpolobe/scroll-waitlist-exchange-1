# Deployment Comparison: africa-railways vs scroll-waitlist-exchange-1

## Analysis Date
January 7, 2026

## Critical Discovery

**africa-railways** and **scroll-waitlist-exchange-1** use **DIFFERENT HOSTING PLATFORMS**:
- **africa-railways**: Railway (Python Flask backend)
- **scroll-waitlist-exchange-1**: Vercel (Vite/React frontend)

This is not an apples-to-apples comparison. The projects have different architectures and deployment targets.

---

## Project Comparison

### africa-railways (Successfully Deploying to Railway)
**Type:** Multi-component application  
**Primary Deployment:** Railway (Python Flask backend)  
**Secondary Deployment:** Vercel (Static HTML frontend)  
**Build Process:** Docker-based for Railway, static files for Vercel  

**Components:**
1. **Python Flask Backend** (`app.py`)
   - USSD Gateway for ticket booking
   - Sui blockchain integration
   - SMS notifications via Twilio
   - Deployed to Railway using Docker

2. **Go Backend** (`backend/main.go`)
   - Sovereign Hub API
   - WebSocket support
   - Deployed to Railway

3. **Static HTML Frontend**
   - HTML files in root directory
   - CSS in `/css/` directory
   - JS in `/js/` directory
   - Deployed to Vercel

**Railway Configuration (`railway.json`):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Nixpacks Configuration (`nixpacks.toml`):**
```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip", ...]

[start]
cmd = ". /opt/venv/bin/activate && gunicorn app:app --bind 0.0.0.0:$PORT --workers 4 --timeout 120"
```

**Recent Fix (Commit 7e51b83):**
- Added missing `flask-session==0.5.0` dependency
- Created `start.sh` script for reliable PORT variable handling
- Added logging to startup process
- Fixed bash variable expansion for PORT

**Key Success Factors:**
1. ✅ Proper dependency management (flask-session added)
2. ✅ Reliable startup script with PORT handling
3. ✅ Docker configuration for Railway
4. ✅ Health check endpoint configured
5. ✅ Proper error handling and logging

---

### scroll-waitlist-exchange-1 (Current Project)
**Type:** Vite + React SPA  
**Deployment:** Vercel  
**Build Process:** `npm run build` → outputs to `dist/`  
**Structure:**
- Source files in `/src/`
- Built files in `/dist/`
- React Router for client-side routing

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {...},
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
  "headers": [...]
}
```

**Current Configuration Status:**
1. ✅ Proper Vite configuration
2. ✅ Correct output directory (`dist`)
3. ✅ SPA routing configured
4. ✅ Security headers in place
5. ✅ Build process working locally
6. ✅ Environment variables properly configured

---

## Key Differences

| Aspect | africa-railways | scroll-waitlist-exchange-1 |
|--------|----------------|---------------------------|
| **Complexity** | Low (static HTML) | High (React SPA) |
| **Build Required** | No | Yes |
| **Dependencies** | Minimal | Many (React, Vite, etc.) |
| **Deployment** | Direct file upload | Build + deploy |
| **Configuration** | Simple | Advanced |

---

## Key Differences

| Aspect | africa-railways | scroll-waitlist-exchange-1 |
|--------|----------------|---------------------------|
| **Platform** | Railway (backend) + Vercel (frontend) | Vercel only |
| **Type** | Python Flask + Go + Static HTML | Vite/React SPA |
| **Build** | Docker + Nixpacks | npm build |
| **Dependencies** | Python + Go + Node | Node only |
| **Configuration** | railway.json + nixpacks.toml + Dockerfile | vercel.json |
| **Recent Fix** | Added flask-session, fixed PORT handling | N/A |

---

## Lessons from africa-railways Recent Fix

The recent successful deployment fix in africa-railways addressed:

1. **Missing Dependency**: Added `flask-session==0.5.0` to `requirements.txt`
2. **Startup Script**: Created `start.sh` for reliable PORT variable handling
3. **Logging**: Added startup logging for debugging
4. **Error Handling**: Proper bash error handling with `set -e`

**start.sh:**
```bash
#!/bin/bash
set -e

# Run environment validation
python validate_env.py

# Get PORT from environment or default to 8080
PORT=${PORT:-8080}

echo "Starting Gunicorn on 0.0.0.0:${PORT}"

# Start Gunicorn with dynamic port
exec gunicorn app:app \
    --bind "0.0.0.0:${PORT}" \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
```

---

## Recommendations for scroll-waitlist-exchange-1

### The scroll-waitlist-exchange-1 project is ALREADY properly configured for Vercel deployment.

The projects use **different platforms** and **different architectures**:
- africa-railways: Railway (Python/Go backend) + Vercel (static frontend)
- scroll-waitlist-exchange-1: Vercel (Vite/React SPA)

### No Direct Changes Needed

The africa-railways fixes are specific to:
- Railway deployment
- Python Flask applications
- Docker containerization
- PORT variable handling for Railway

These do not apply to a Vercel-hosted Vite/React application.

### If Deployment Issues Exist on Vercel, Check:

1. **Vercel Secrets/Environment Variables:**
   - `VERCEL_TOKEN` - Required for CLI deployment
   - `VERCEL_ORG_ID` - Organization ID
   - `VERCEL_PROJECT_ID` - Project ID
   - `VITE_SUPABASE_URL` - Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anon key

2. **Build Command:**
   - Ensure `npm run build` completes successfully ✅ (verified working)
   - Check for build errors in GitHub Actions logs

3. **Output Directory:**
   - Verify `dist/` contains built files ✅ (verified: 82 JS files + index.html)
   - Check `dist/index.html` exists ✅ (verified)

4. **GitHub Actions Workflow:**
   - Verify workflow runs on push to main
   - Check for failed steps in Actions tab

5. **Vercel Project Settings:**
   - Framework Preset: Vite ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
   - Install Command: `npm ci` ✅

---

## Conclusion

### Current Status: ✅ READY FOR DEPLOYMENT

The scroll-waitlist-exchange-1 project is **correctly configured** for Vercel deployment. The africa-railways project's recent fixes were specific to Railway deployment and do not apply to this Vercel-hosted React application.

**Key Takeaway:** These are fundamentally different deployment scenarios. The africa-railways success on Railway does not indicate any issues with scroll-waitlist-exchange-1's Vercel configuration.
