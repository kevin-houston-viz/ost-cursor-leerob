# Ostly Deployment Guide

This guide covers deploying Ostly to production using Vercel (frontend) and Railway (backend).

---

## 🚀 Quick Deploy

### **Prerequisites**
- GitHub account (for connecting to deployment platforms)
- Vercel account ([vercel.com](https://vercel.com))
- Railway account ([railway.app](https://railway.app))
- Code pushed to GitHub repository

---

## 📦 Frontend Deployment (Vercel)

### **Method 1: Vercel CLI (Recommended)**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   # First deployment (will ask configuration questions)
   vercel
   
   # Production deployment
   vercel --prod
   ```

5. **Set Environment Variables** (in Vercel dashboard):
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `NODE_ENV` = `production`
     - `NEXT_PUBLIC_API_URL` = `<your-railway-backend-url>`

### **Method 2: Vercel GitHub Integration**

1. **Push code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select `frontend` directory as the root
   - Framework will auto-detect as Angular
   - Click "Deploy"

3. **Configure Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/frontend/browser`
   - **Install Command**: `npm install`
   - **Root Directory**: `frontend`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

### **Vercel Configuration**

The `vercel.json` file is already configured with:
- ✅ Single Page Application routing
- ✅ Security headers (XSS, Frame Options, Content Type)
- ✅ Production build optimization
- ✅ Automatic HTTPS

---

## 🚂 Backend Deployment (Railway)

### **Method 1: Railway CLI**

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

4. **Initialize and Deploy**:
   ```bash
   railway init
   railway up
   ```

5. **Add PostgreSQL Database**:
   ```bash
   railway add --database postgres
   ```

6. **Set Environment Variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

### **Method 2: Railway GitHub Integration**

1. **Push code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Create New Project in Railway**:
   - Go to [railway.app/new](https://railway.app/new)
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` as the root directory

3. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically inject `DATABASE_URL`

4. **Configure Environment Variables**:
   Go to Variables tab and add:
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

5. **Configure Build & Deploy**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
   - **Health Check Path**: `/health`

### **Railway Configuration**

The `railway.json` file is already configured with:
- ✅ Build command: `npm run build`
- ✅ Start command: `npm start`
- ✅ Health check endpoint: `/health`
- ✅ Auto-restart on failure

---

## 🗄️ Database Setup

### **Railway PostgreSQL**

Railway will automatically provide a PostgreSQL database with the following environment variable:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### **Run Database Migrations**

After deploying, run the schema initialization:

1. **Option A: Railway CLI**:
   ```bash
   railway run psql $DATABASE_URL < ../database-schema.sql
   ```

2. **Option B: Railway Dashboard**:
   - Go to your PostgreSQL service
   - Click "Data" tab
   - Use the built-in SQL editor
   - Paste contents of `database-schema.sql`
   - Execute

### **Alternative: Use Supabase or Neon**

Instead of Railway PostgreSQL, you can use:
- **Supabase** (free tier): [supabase.com](https://supabase.com)
- **Neon** (serverless): [neon.tech](https://neon.tech)
- **Railway PostgreSQL** (recommended for simplicity)

---

## 🔐 Environment Variables

### **Frontend (Vercel)**

Create these in Vercel Dashboard → Settings → Environment Variables:

```env
# Production
NODE_ENV=production

# API URL (your Railway backend URL)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### **Backend (Railway)**

Create these in Railway Dashboard → Variables:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3000

# Database (automatically injected by Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Or individual credentials if not using Railway PostgreSQL:
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=ostly_db
DB_USER=ostly_user
DB_PASSWORD=your-secure-password

# CORS Configuration
CORS_ORIGIN=https://your-vercel-app.vercel.app
FRONTEND_URL=https://your-vercel-app.vercel.app

# Future: Authentication (when implemented)
# JWT_SECRET=your-super-secret-jwt-key
# JWT_EXPIRES_IN=7d
```

---

## 🔄 Continuous Deployment

### **Automatic Deployments on Git Push**

Both Vercel and Railway support automatic deployments:

1. **Connect GitHub Repository**:
   - Both platforms auto-detect pushes to `main` branch
   - Automatic build and deploy on every commit
   - Preview deployments for pull requests (Vercel)

2. **Branch Deployments**:
   - **Production**: Pushes to `main` → Production deployment
   - **Preview**: Pull requests → Preview deployment (Vercel)
   - **Development**: Pushes to `dev` → Development deployment (optional)

### **Manual Deployments**

```bash
# Frontend (Vercel)
cd frontend
vercel --prod

# Backend (Railway)
cd backend
railway up
```

---

## 🔍 Health Checks & Monitoring

### **Backend Health Check**

The backend includes a health check endpoint:
- **URL**: `https://your-backend.railway.app/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-10-01T12:00:00.000Z",
    "database": "connected"
  }
  ```

### **Monitoring**

- **Vercel**: Built-in analytics and monitoring
- **Railway**: Metrics tab shows CPU, memory, network usage
- **Database**: Railway PostgreSQL metrics

---

## 📊 Deployment Checklist

### **Before First Deployment**

- [ ] Code is committed and pushed to GitHub
- [ ] `vercel.json` exists in `frontend/` directory
- [ ] `railway.json` exists in `backend/` directory
- [ ] Database schema (`database-schema.sql`) is ready
- [ ] Environment variables are documented
- [ ] CORS settings are configured correctly

### **Frontend Deployment**

- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist/frontend/browser`
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)

### **Backend Deployment**

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] GitHub repository connected
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Database schema migrated
- [ ] Health check endpoint responding
- [ ] CORS configured for frontend domain

### **Post-Deployment**

- [ ] Frontend loads successfully
- [ ] Backend API is accessible
- [ ] Database connection works
- [ ] Health check endpoint returns 200
- [ ] CORS allows frontend requests
- [ ] Dark/Light mode works
- [ ] Test create/read/update/delete operations

---

## 🐛 Troubleshooting

### **Frontend Issues**

**Build Fails**:
```bash
# Check build locally first
cd frontend
npm run build

# Check logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Dependency issues
```

**404 Errors on Routes**:
- Ensure `vercel.json` has the SPA routing configuration
- All routes should redirect to `/index.html`

**API Calls Failing**:
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend CORS settings
- Check browser console for errors

### **Backend Issues**

**Build Fails**:
```bash
# Check build locally first
cd backend
npm run build

# Check logs in Railway dashboard
# Common issues:
# - TypeScript compilation errors
# - Missing dependencies
```

**Database Connection Fails**:
```bash
# Verify DATABASE_URL is set correctly
railway variables

# Check database is running
# Go to Railway dashboard → PostgreSQL service → Metrics
```

**Health Check Fails**:
```bash
# Test health endpoint
curl https://your-backend.railway.app/health

# Check logs in Railway dashboard
railway logs
```

**CORS Errors**:
- Verify `CORS_ORIGIN` environment variable matches your frontend URL
- Ensure it includes `https://` protocol
- Check Railway logs for CORS-related errors

---

## 🔄 Rollback

### **Vercel Rollback**

1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments" tab
4. Find a previous successful deployment
5. Click "Promote to Production"

### **Railway Rollback**

1. Go to Railway dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click on a previous deployment
5. Click "Redeploy"

---

## 📈 Scaling

### **Vercel**
- Automatic scaling (serverless)
- CDN edge caching globally
- No configuration needed

### **Railway**
- Vertical scaling: Upgrade plan for more CPU/RAM
- Horizontal scaling: Contact Railway for enterprise
- Database connection pooling (already configured)

---

## 💰 Costs

### **Free Tier Limits**

**Vercel**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments

**Railway**:
- ✅ $5 free credit/month
- ✅ PostgreSQL database included
- ✅ Automatic HTTPS
- ✅ 512MB RAM, 1GB disk

**Total**: ~$0-10/month for development/small production

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Angular Deployment Guide](https://angular.dev/tools/cli/deployment)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

---

## 📝 Summary

### **Deployment Commands**

```bash
# Frontend (Vercel)
cd frontend
vercel login
vercel --prod

# Backend (Railway)
cd backend
railway login
railway init
railway up

# Add Database
railway add --database postgres

# Run migrations
railway run psql $DATABASE_URL < ../database-schema.sql
```

### **URLs After Deployment**

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/health`

---

**Last Updated**: October 1, 2025  
**Deployment Status**: Ready for production deployment 🚀



