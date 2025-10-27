# GitHub Setup & Push Instructions

## Step 1: Initialize Git Repository

Open PowerShell in the project root directory and run:

```powershell
cd "c:\Users\birad\Downloads\DESK-TOP\HACKPRJ\DEPLOY\Working3\ai-hrms"
git init
```

## Step 2: Create .gitignore File

Create a `.gitignore` file to exclude sensitive files:

```
# Environment variables
.env
.env.local
.env.*.local
.env.production

# Node modules
node_modules/
npm-debug.log
yarn-error.log

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Build outputs
frontend/dist/
backend/node_modules/
ai-service/venv/

# Logs
logs/
*.log

# Database
*.db
*.sqlite
*.sqlite3

# OS
Thumbs.db
.DS_Store
```

## Step 3: Add All Files

```powershell
git add .
```

## Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit: AI-HRMS full-stack application with deployment configuration"
```

## Step 5: Add Remote Repository

Replace `aditya-biradar-developer` with your GitHub username:

```powershell
git remote add origin https://github.com/aditya-biradar-developer/HRMS.git
```

## Step 6: Rename Branch to Main

```powershell
git branch -M main
```

## Step 7: Push to GitHub

```powershell
git push -u origin main
```

This will push all your code to GitHub. You may be prompted to authenticate.

---

## Complete Command Sequence

Copy and paste this entire block into PowerShell:

```powershell
cd "c:\Users\birad\Downloads\DESK-TOP\HACKPRJ\DEPLOY\Working3\ai-hrms"
git init
git add .
git commit -m "Initial commit: AI-HRMS full-stack application with deployment configuration"
git remote add origin https://github.com/aditya-biradar-developer/HRMS.git
git branch -M main
git push -u origin main
```

---

## Verify Push Success

After pushing, verify on GitHub:

1. Go to https://github.com/aditya-biradar-developer/HRMS
2. You should see all your files
3. Check that `.env` files are NOT visible (they should be in .gitignore)

---

## Next Steps After Push

Once code is on GitHub:

1. ✅ Go to Render Dashboard: https://dashboard.render.com
2. ✅ Create Frontend (Static Site)
3. ✅ Create Backend (Web Service)
4. ✅ Create AI Service (Web Service)
5. ✅ Add environment variables
6. ✅ Test deployment

Follow: **QUICK_RENDER_SETUP.md** for deployment

---

## Troubleshooting

### "fatal: not a git repository"
```powershell
git init
```

### "Permission denied" when pushing
- Check GitHub credentials
- May need to use personal access token instead of password
- Go to GitHub Settings → Developer Settings → Personal Access Tokens

### "remote already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/aditya-biradar-developer/HRMS.git
```

### Large files causing issues
Add to .gitignore and remove from tracking:
```powershell
git rm --cached filename
git add .gitignore
git commit -m "Remove large file"
```

---

## Important Notes

- ✅ Never commit `.env` files (use .gitignore)
- ✅ Never commit `node_modules/` or `__pycache__/`
- ✅ Always use meaningful commit messages
- ✅ Push regularly to avoid losing work

---

Ready to push? Run the complete command sequence above!
