# Complete Deployment Steps: GitHub → Render

## 📋 Overview

This guide walks you through:
1. Pushing code to GitHub
2. Deploying to Render (3 services)
3. Testing the deployment

**Total time**: ~20 minutes

---

## PART 1: Push to GitHub (5 minutes)

### Step 1.1: Open PowerShell

Open PowerShell and navigate to your project:

```powershell
cd "c:\Users\birad\Downloads\DESK-TOP\HACKPRJ\DEPLOY\Working3\ai-hrms"
```

### Step 1.2: Initialize Git

```powershell
git init
```

### Step 1.3: Add All Files

```powershell
git add .
```

### Step 1.4: Create Initial Commit

```powershell
git commit -m "Initial commit: AI-HRMS full-stack application with deployment configuration"
```

### Step 1.5: Add Remote Repository

Replace `aditya-biradar-developer` with your GitHub username:

```powershell
git remote add origin https://github.com/aditya-biradar-developer/HRMS.git
```

### Step 1.6: Rename Branch

```powershell
git branch -M main
```

### Step 1.7: Push to GitHub

```powershell
git push -u origin main
```

You may be prompted to authenticate. Use your GitHub credentials or personal access token.

### ✅ Verify Push

Go to: https://github.com/aditya-biradar-developer/HRMS

You should see all your files there.

---

## PART 2: Deploy to Render (15 minutes)

### Prerequisites

Before deploying, gather these:

- [ ] GitHub repository URL: `https://github.com/aditya-biradar-developer/HRMS`
- [ ] Supabase Project URL
- [ ] Supabase Anon Key
- [ ] Supabase Service Role Key
- [ ] Google Gemini API Key
- [ ] GROQ API Key
- [ ] Gmail address
- [ ] Gmail app password
- [ ] JWT Secret (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## Step 2.1: Deploy Frontend (2 minutes)

1. Go to: https://dashboard.render.com
2. Sign in with GitHub
3. Click **"New +"** → **"Static Site"**
4. Select your GitHub repository
5. Fill in:
   - **Name**: `ai-hrms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
6. Click **"Create Static Site"**
7. Wait for deployment (2-3 minutes)
8. **Copy the URL**: `https://ai-hrms-frontend.onrender.com`

---

## Step 2.2: Deploy Backend (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `ai-hrms-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
4. Click **"Create Web Service"**
5. Go to **"Environment"** tab
6. Add these environment variables:

```
# Database
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# API Keys
GOOGLE_API_KEY=[your-google-key]
GROQ_API_KEY=[your-groq-key]

# Email
EMAIL_USER=[your-gmail@gmail.com]
EMAIL_PASSWORD=[your-app-password]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# URLs
FRONTEND_URL=https://ai-hrms-frontend.onrender.com
AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
BACKEND_URL=https://ai-hrms-backend.onrender.com

# Security
JWT_SECRET=[your-jwt-secret]
JWT_EXPIRE=7d

# Environment
NODE_ENV=production
PORT=5000
```

7. Click **"Save"**
8. Wait for deployment (3-5 minutes)
9. **Copy the URL**: `https://ai-hrms-backend.onrender.com`

---

## Step 2.3: Deploy AI Service (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `ai-hrms-ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `cd ai-service && pip install -r requirements.txt`
   - **Start Command**: `cd ai-service && gunicorn --bind 0.0.0.0:5001 app:app`
   - **Plan**: Free
4. Click **"Create Web Service"**
5. Go to **"Environment"** tab
6. Add these environment variables:

```
GOOGLE_API_KEY=[your-google-key]
GROQ_API_KEY=[your-groq-key]
BACKEND_URL=https://ai-hrms-backend.onrender.com
PORT=5001
FLASK_ENV=production
```

7. Click **"Save"**
8. Wait for deployment (3-5 minutes)
9. **Copy the URL**: `https://ai-hrms-ai-service.onrender.com`

---

## PART 3: Update Configuration (2 minutes)

### Step 3.1: Update Backend CORS

Edit `backend/server.js` (around line 40):

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ai-hrms-frontend.onrender.com',  // Add this
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
```

### Step 3.2: Commit and Push

```powershell
git add backend/server.js
git commit -m "Update CORS for Render deployment"
git push origin main
```

Render will auto-redeploy the backend.

---

## PART 4: Testing (3 minutes)

### Test 1: Frontend Loads

Open in browser:
```
https://ai-hrms-frontend.onrender.com
```

Expected: Login page loads without errors

### Test 2: Backend Health

```powershell
curl https://ai-hrms-backend.onrender.com/api/health
```

Expected: `{"status":"ok"}`

### Test 3: AI Service Health

```powershell
curl https://ai-hrms-ai-service.onrender.com/health
```

Expected: `{"status":"ok"}`

### Test 4: Full Login Flow

1. Go to frontend URL
2. Create account
3. Login
4. Should see dashboard

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed and loads
- [ ] Backend deployed and health check passes
- [ ] AI service deployed and health check passes
- [ ] Can create account
- [ ] Can login successfully
- [ ] No console errors
- [ ] No CORS errors

---

## 🐛 Troubleshooting

### Frontend shows blank page
- Check browser console (F12)
- Verify VITE_API_URL in .env.production
- Check Render build logs

### Backend 500 error
- Check all environment variables are set
- Verify Supabase credentials
- Check Render logs

### CORS errors
- Update CORS in backend/server.js
- Add frontend URL to allowed origins
- Redeploy backend

### AI service timeout
- Check API keys are valid
- Verify network connectivity
- Check Render logs

---

## 📊 Deployment URLs

After successful deployment:

| Service | URL |
|---------|-----|
| Frontend | https://ai-hrms-frontend.onrender.com |
| Backend | https://ai-hrms-backend.onrender.com |
| AI Service | https://ai-hrms-ai-service.onrender.com |

---

## 🎯 Next Steps

1. ✅ Monitor the deployment
2. ✅ Set up monitoring/alerts
3. ✅ Configure custom domain (optional)
4. ✅ Set up database backups
5. ✅ Share URLs with team

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Docs**: https://docs.github.com

---

## 🎉 Congratulations!

Your AI-HRMS application is now deployed to Render!

**Total deployment time**: ~20 minutes

Good luck! 🚀
