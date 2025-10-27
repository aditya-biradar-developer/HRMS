# Render Deployment Checklist

## Pre-Deployment Checklist

### Repository Setup
- [ ] GitHub repository created and public
- [ ] All code committed and pushed to main branch
- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] `render.yaml` file exists in root directory
- [ ] `RENDER_DEPLOYMENT_GUIDE.md` reviewed

### API Keys & Credentials
- [ ] Google Gemini API key obtained
- [ ] GROQ API key obtained (optional but recommended)
- [ ] Gmail account with app password generated
- [ ] Supabase project created with database
- [ ] Supabase credentials copied:
  - [ ] Project URL
  - [ ] Anon Key
  - [ ] Service Role Key
- [ ] JWT secret generated (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Database Preparation
- [ ] Supabase database created
- [ ] SQL migrations executed (from `database/` folder)
- [ ] Row Level Security (RLS) policies configured
- [ ] Database tables verified in Supabase dashboard
- [ ] Test connection from local machine works

### Code Verification
- [ ] Frontend builds locally: `npm run build` in frontend/
- [ ] Backend starts locally: `npm start` in backend/
- [ ] AI service starts locally: `python app.py` in ai-service/
- [ ] No hardcoded URLs or credentials in code
- [ ] Environment variables properly referenced in code

---

## Deployment Steps

### Step 1: Frontend Deployment
- [ ] Create Static Site on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `cd frontend && npm install && npm run build`
- [ ] Set publish directory: `frontend/dist`
- [ ] Deployment successful
- [ ] Copy frontend URL: `https://ai-hrms-frontend.onrender.com`

### Step 2: Backend Deployment
- [ ] Create Web Service on Render
- [ ] Select Node environment
- [ ] Set build command: `cd backend && npm install`
- [ ] Set start command: `cd backend && npm start`
- [ ] Add all environment variables (see template below)
- [ ] Deployment successful
- [ ] Copy backend URL: `https://ai-hrms-backend.onrender.com`

### Step 3: AI Service Deployment
- [ ] Create Web Service on Render
- [ ] Select Python environment
- [ ] Set build command: `cd ai-service && pip install -r requirements.txt`
- [ ] Set start command: `cd ai-service && gunicorn --bind 0.0.0.0:5001 app:app`
- [ ] Add environment variables
- [ ] Deployment successful
- [ ] Copy AI service URL: `https://ai-hrms-ai-service.onrender.com`

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Edit `backend/server.js` line 40-47
- [ ] Add frontend URL to CORS origins
- [ ] Commit and push changes
- [ ] Backend auto-redeploys

### Update Frontend URLs
- [ ] Edit `frontend/.env.production`
- [ ] Set VITE_API_URL to backend URL
- [ ] Set VITE_AI_SERVICE_URL to AI service URL
- [ ] Verify API configuration in code
- [ ] Commit and push changes
- [ ] Frontend auto-redeploys

### Update AI Service CORS
- [ ] Edit `ai-service/app.py`
- [ ] Add frontend and backend URLs to CORS origins
- [ ] Commit and push changes
- [ ] AI service auto-redeploys

---

## Testing & Verification

### Frontend Testing
- [ ] Frontend URL loads without errors
- [ ] Login page displays correctly
- [ ] No console errors in browser
- [ ] Responsive design works on mobile

### Backend Testing
- [ ] Health check endpoint responds: `curl https://ai-hrms-backend.onrender.com/api/health`
- [ ] Database connection works
- [ ] Can create user account
- [ ] Can login successfully
- [ ] API endpoints respond correctly

### AI Service Testing
- [ ] Health check endpoint responds: `curl https://ai-hrms-ai-service.onrender.com/health`
- [ ] Can generate questions
- [ ] Can screen resumes
- [ ] Can generate emails
- [ ] API keys are working

### Integration Testing
- [ ] Frontend connects to backend
- [ ] Backend connects to AI service
- [ ] Backend connects to Supabase
- [ ] Full login flow works
- [ ] Assessment generation works
- [ ] Results are saved to database

---

## Environment Variables Template

### Backend Environment Variables
```
# Database
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# API Keys
GOOGLE_API_KEY=[your-google-gemini-key]
GROQ_API_KEY=[your-groq-key]

# Email Configuration
EMAIL_USER=[your-gmail@gmail.com]
EMAIL_PASSWORD=[your-app-password]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Backend Configuration
NODE_ENV=production
PORT=5000
BACKEND_URL=https://ai-hrms-backend.onrender.com
AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
FRONTEND_URL=https://ai-hrms-frontend.onrender.com

# Security
JWT_SECRET=[your-generated-secret]
JWT_EXPIRE=7d

# Google OAuth (if using)
GOOGLE_CLIENT_ID=[your-client-id]
GOOGLE_CLIENT_SECRET=[your-client-secret]
GOOGLE_CALLBACK_URL=https://ai-hrms-backend.onrender.com/api/auth/google/callback
```

### AI Service Environment Variables
```
# API Keys
GOOGLE_API_KEY=[your-google-gemini-key]
GROQ_API_KEY=[your-groq-key]

# Backend Communication
BACKEND_URL=https://ai-hrms-backend.onrender.com

# Configuration
PORT=5001
FLASK_ENV=production
```

### Frontend Environment Variables
```
VITE_API_URL=https://ai-hrms-backend.onrender.com
VITE_AI_SERVICE_URL=https://ai-hrms-ai-service.onrender.com
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check Render dashboard for service status
- [ ] Monitor error logs
- [ ] Verify database performance
- [ ] Check API response times

### Weekly Checks
- [ ] Review error logs for patterns
- [ ] Check database backup status
- [ ] Verify all API endpoints working
- [ ] Monitor resource usage

### Monthly Checks
- [ ] Review and rotate API keys
- [ ] Update dependencies
- [ ] Backup database manually
- [ ] Review security settings
- [ ] Check for performance improvements

---

## Troubleshooting Guide

### Frontend Issues
| Issue | Solution |
|-------|----------|
| Blank page | Check browser console, verify API URL |
| 404 errors | Check build logs, verify dist folder |
| CORS errors | Update backend CORS, redeploy |
| Slow loading | Check Render logs, may be spinning up |

### Backend Issues
| Issue | Solution |
|-------|----------|
| 500 errors | Check environment variables, database connection |
| Database errors | Verify Supabase credentials, check RLS policies |
| API timeouts | Check AI service connectivity, increase timeout |
| Memory errors | Upgrade Render plan, optimize queries |

### AI Service Issues
| Issue | Solution |
|-------|----------|
| API key errors | Verify keys are correct, check quotas |
| Timeout errors | Check network connectivity, increase timeout |
| Memory errors | Reduce model size, upgrade plan |
| Build failures | Check Python version, verify requirements.txt |

---

## Rollback Procedure

If deployment fails:

1. **Check Render Logs**
   - Go to service dashboard
   - Click "Logs" tab
   - Look for error messages

2. **Revert Code Changes**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

3. **Render Auto-Redeploys**
   - Service will automatically redeploy
   - Check logs for success

4. **Manual Rollback**
   - Go to service dashboard
   - Click "Manual Deploy"
   - Select previous deployment

---

## Performance Optimization

### Frontend
- [ ] Enable gzip compression
- [ ] Minify assets (Vite does this)
- [ ] Use lazy loading for routes
- [ ] Cache static assets

### Backend
- [ ] Use connection pooling
- [ ] Implement caching
- [ ] Optimize database queries
- [ ] Use rate limiting

### AI Service
- [ ] Cache model responses
- [ ] Use request queuing
- [ ] Optimize API calls
- [ ] Monitor token usage

---

## Security Checklist

- [ ] All API keys stored in environment variables
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Regular security updates

---

## Support & Documentation

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Express.js Docs**: https://expressjs.com
- **Flask Docs**: https://flask.palletsprojects.com
- **React Docs**: https://react.dev

---

## Final Sign-Off

- [ ] All services deployed successfully
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] Ready for production

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _______________

---

Good luck with your deployment! 🚀
