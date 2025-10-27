# AI-HRMS Deployment Guide for Render

## Project Overview
This is a full-stack AI-powered HRMS application with:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Node.js/Express API (Port 5000)
- **AI Service**: Python/Flask microservice (Port 5001)
- **Database**: Supabase PostgreSQL

---

## Deployment Architecture on Render

You'll need to deploy **3 separate services** on Render:

### 1. Frontend (React + Vite)
- **Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `frontend/dist`

### 2. Backend (Node.js/Express)
- **Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 5000

### 3. AI Service (Python/Flask)
- **Type**: Web Service
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python app.py`
- **Port**: 5001

---

## Step-by-Step Deployment Instructions

### Prerequisites
1. Render account (render.com)
2. GitHub repository with this code
3. Supabase database credentials
4. API keys for:
   - Google Gemini API
   - GROQ API (optional)
   - Email service credentials

---

## Part 1: Deploy Frontend

### 1.1 Create Static Site on Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-hrms-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: `.` (leave empty)

5. Click **"Create Static Site"**

### 1.2 Update Frontend Environment Variables

After frontend is deployed, you'll get a URL like: `https://ai-hrms-frontend.onrender.com`

Create/update `frontend/.env.production`:
```
VITE_API_URL=https://ai-hrms-backend.onrender.com
VITE_AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
```

Update `frontend/src/config/api.js` or similar to use these environment variables.

---

## Part 2: Deploy Backend (Node.js)

### 2.1 Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-hrms-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Port**: `5000`

### 2.2 Add Environment Variables

In the Render dashboard for the backend service, add these environment variables:

```
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Keys
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Backend Configuration
NODE_ENV=production
PORT=5000
BACKEND_URL=https://ai-hrms-backend.onrender.com
AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com

# CORS
FRONTEND_URL=https://ai-hrms-frontend.onrender.com

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://ai-hrms-backend.onrender.com/api/auth/google/callback
```

### 2.3 Update Backend CORS Configuration

Update `backend/server.js` to accept Render URLs:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ai-hrms-frontend.onrender.com', // Add this
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
```

---

## Part 3: Deploy AI Service (Python/Flask)

### 3.1 Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ai-hrms-ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `cd ai-service && pip install -r requirements.txt`
   - **Start Command**: `cd ai-service && gunicorn --bind 0.0.0.0:5001 app:app`
   - **Port**: `5001`

### 3.2 Add Environment Variables

In the Render dashboard for the AI service, add:

```
# API Keys
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Backend Communication
BACKEND_URL=https://ai-hrms-backend.onrender.com
PORT=5001

# Environment
FLASK_ENV=production
```

### 3.3 Update AI Service CORS

Update `ai-service/app.py`:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://ai-hrms-frontend.onrender.com",
            "https://ai-hrms-backend.onrender.com",
            os.getenv('FRONTEND_URL', ''),
            os.getenv('BACKEND_URL', '')
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### 3.4 Add Gunicorn to Requirements

Add to `ai-service/requirements.txt`:
```
gunicorn==21.2.0
```

---

## Part 4: Update API Endpoints

### 4.1 Frontend API Configuration

Create `frontend/src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Applications
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  
  // AI Services
  GENERATE_QUESTIONS: `${AI_SERVICE_URL}/api/ai/generate-questions`,
  SCREEN_RESUME: `${AI_SERVICE_URL}/api/ai/screen-resume`,
};

export default API_BASE_URL;
```

### 4.2 Backend API Configuration

Update `backend/config/db.js` to use environment variables for Supabase:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
```

---

## Part 5: Database Setup

### 5.1 Supabase Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your credentials:
   - Project URL
   - Anon Key
   - Service Role Key

3. Run database migrations:
   - Copy SQL files from `database/` folder
   - Execute them in Supabase SQL editor

### 5.2 Enable Row Level Security (RLS)

For each table, enable RLS policies:

```sql
-- Example for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

---

## Part 6: Deployment Checklist

### Before Deploying
- [ ] All environment variables configured
- [ ] Database migrations executed
- [ ] API keys obtained (Google, GROQ, etc.)
- [ ] Email service configured
- [ ] GitHub repository is public or Render has access

### After Deploying
- [ ] Test frontend URL loads
- [ ] Test backend API health check: `https://ai-hrms-backend.onrender.com/api/health`
- [ ] Test AI service health check: `https://ai-hrms-ai-service.onrender.com/health`
- [ ] Test login functionality
- [ ] Test assessment generation
- [ ] Monitor logs for errors

---

## Part 7: Troubleshooting

### Frontend Not Loading
- Check build logs in Render dashboard
- Verify `npm run build` works locally
- Check VITE_API_URL environment variable

### Backend Errors
- Check environment variables are set
- Verify Supabase credentials
- Check database connection: `npm run test-db`
- Review logs in Render dashboard

### AI Service Issues
- Verify Python version (3.9+)
- Check API keys are valid
- Review Flask logs
- Test health endpoint

### CORS Errors
- Update CORS configuration in both backend and AI service
- Verify frontend URL is in allowed origins
- Check browser console for specific error

---

## Part 8: Monitoring & Maintenance

### Enable Logging
- Use Render's built-in log viewer
- Set up error tracking (Sentry, etc.)
- Monitor database usage

### Auto-Restart
- Render automatically restarts services on deploy
- Set up health checks for uptime monitoring

### Database Backups
- Enable automatic backups in Supabase
- Regular manual exports recommended

---

## Part 9: Production Optimization

### Frontend
- Enable caching headers
- Minify assets (Vite does this automatically)
- Use CDN for static assets

### Backend
- Use connection pooling for database
- Enable rate limiting (already configured)
- Use Redis for caching (optional)

### AI Service
- Use Gunicorn with multiple workers
- Implement request queuing for heavy operations
- Cache AI model responses

---

## Useful Commands

```bash
# Test local deployment
npm run dev  # Frontend
npm run dev  # Backend
python app.py  # AI Service

# Build for production
npm run build  # Frontend

# Test database connection
npm run test-db  # Backend

# Check health endpoints
curl https://ai-hrms-backend.onrender.com/api/health
curl https://ai-hrms-ai-service.onrender.com/health
```

---

## Support & Documentation

- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
- Express.js Docs: https://expressjs.com
- Flask Docs: https://flask.palletsprojects.com
- React Docs: https://react.dev

---

## Next Steps

1. Create Render account
2. Follow deployment steps for each service
3. Configure environment variables
4. Test all endpoints
5. Set up monitoring
6. Deploy to production

Good luck with your deployment! 🚀
