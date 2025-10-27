# Quick Render Deployment Setup (5-10 minutes)

## Prerequisites
- Render account (free at render.com)
- GitHub account with this repository
- Supabase account with database created
- API keys ready:
  - Google Gemini API key
  - GROQ API key (optional)
  - Email credentials (Gmail)

---

## Step 1: Prepare Your GitHub Repository

Make sure your repository is pushed to GitHub with these files:
- `frontend/` - React app
- `backend/` - Node.js API
- `ai-service/` - Python Flask service
- `render.yaml` - Deployment config (already created)

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Deploy Frontend (2 minutes)

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Static Site"**
3. Select your GitHub repository
4. Fill in:
   - **Name**: `ai-hrms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
5. Click **"Create Static Site"**
6. Wait for deployment (2-3 minutes)
7. Copy the URL: `https://ai-hrms-frontend.onrender.com`

---

## Step 3: Deploy Backend (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `ai-hrms-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Click **"Create Web Service"**
5. Go to **Environment** tab and add these variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=generate_a_random_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://ai-hrms-frontend.onrender.com
AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
```

6. Click **"Save"** and wait for deployment
7. Copy the backend URL: `https://ai-hrms-backend.onrender.com`

---

## Step 4: Deploy AI Service (3 minutes)

1. Click **"New +"** → **"Web Service"**
2. Select your GitHub repository
3. Fill in:
   - **Name**: `ai-hrms-ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `cd ai-service && pip install -r requirements.txt`
   - **Start Command**: `cd ai-service && gunicorn --bind 0.0.0.0:5001 app:app`
   - **Plan**: Free

4. Click **"Create Web Service"**
5. Go to **Environment** tab and add:

```
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
BACKEND_URL=https://ai-hrms-backend.onrender.com
PORT=5001
FLASK_ENV=production
```

6. Click **"Save"** and wait for deployment
7. Copy the AI service URL: `https://ai-hrms-ai-service.onrender.com`

---

## Step 5: Update Backend CORS

Now that you have all URLs, update the backend CORS configuration:

1. Edit `backend/server.js` line 40-47:

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

2. Push to GitHub:
```bash
git add backend/server.js
git commit -m "Update CORS for Render deployment"
git push origin main
```

3. Render will auto-redeploy the backend

---

## Step 6: Update Frontend API URLs

1. Edit `frontend/.env.production`:

```
VITE_API_URL=https://ai-hrms-backend.onrender.com
VITE_AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
```

2. Update `frontend/src/config/api.js` or wherever API calls are made:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';
```

3. Push to GitHub:
```bash
git add frontend/
git commit -m "Update API URLs for production"
git push origin main
```

4. Render will auto-redeploy the frontend

---

## Step 7: Test Your Deployment

### Test Frontend
```
Open: https://ai-hrms-frontend.onrender.com
Expected: Login page loads
```

### Test Backend Health
```
curl https://ai-hrms-backend.onrender.com/api/health
Expected: { "status": "ok" }
```

### Test AI Service Health
```
curl https://ai-hrms-ai-service.onrender.com/health
Expected: { "status": "ok" }
```

### Test Login
1. Go to frontend URL
2. Create account or login
3. Should connect to backend successfully

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check Render build logs

### Backend errors
- Check environment variables are set
- Verify Supabase credentials
- Check Render logs for specific error

### AI Service not working
- Verify API keys are valid
- Check Python version (3.9+)
- Check Render logs

### CORS errors
- Update CORS in backend/server.js
- Add frontend URL to allowed origins
- Redeploy backend

---

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30 seconds
- Limited to 0.5GB RAM
- 100GB bandwidth/month

### Recommendations
- Use paid tier for production
- Set up monitoring/alerts
- Enable auto-deploy on GitHub push
- Regular database backups

### Environment Variables Security
- Never commit `.env` files
- Use Render's environment variable UI
- Rotate API keys regularly
- Use separate keys for different environments

---

## Next Steps

1. ✅ Deploy all 3 services
2. ✅ Test all endpoints
3. ✅ Set up monitoring
4. ✅ Configure custom domain (optional)
5. ✅ Set up SSL certificate (automatic on Render)

---

## Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Supabase Dashboard: https://app.supabase.com
- GitHub: https://github.com

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Service → Logs
2. Check GitHub Actions for build failures
3. Verify all environment variables are set
4. Test locally first: `npm run dev` (frontend), `npm run dev` (backend)

Good luck! 🚀
