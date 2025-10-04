# Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

---

## 🚀 Pre-Deployment

### **Code Quality**
- [ ] All tests passing (`npm test` in frontend and backend)
- [ ] No linter errors (`npm run lint` in frontend and backend)
- [ ] Code formatted (`npm run format` in frontend and backend)
- [ ] No TypeScript errors (`npm run build` in both projects)
- [ ] Code coverage >80% (run `npm run test:coverage` in frontend)

### **Git & Version Control**
- [ ] All changes committed with descriptive messages
- [ ] Code pushed to GitHub `main` branch
- [ ] No sensitive data in repository (API keys, passwords, etc.)
- [ ] `.env` files in `.gitignore`

### **Documentation**
- [ ] README.md updated with latest info
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment guide reviewed

---

## 🎨 Frontend Deployment (Vercel)

### **Pre-Deployment**
- [ ] `vercel.json` configuration file exists in `frontend/`
- [ ] `.vercelignore` file configured
- [ ] Build works locally: `npm run build`
- [ ] Production build output directory: `dist/frontend/browser`
- [ ] All routes tested (Angular routing)

### **Vercel Setup**
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project created in Vercel
- [ ] Framework detected as "Angular"
- [ ] Build settings configured:
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist/frontend/browser`
  - [ ] Install Command: `npm install`
  - [ ] Root Directory: `frontend`

### **Environment Variables (Vercel Dashboard)**
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_API_URL=<railway-backend-url>`
- [ ] Variables set for "Production" environment
- [ ] Variables set for "Preview" environment (optional)

### **Deployment**
- [ ] First deployment successful
- [ ] Site accessible at Vercel URL
- [ ] All pages load correctly
- [ ] No console errors in browser
- [ ] Dark/Light mode toggle works
- [ ] API calls work (check Network tab)

### **Custom Domain (Optional)**
- [ ] Domain purchased/available
- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate active (automatic)
- [ ] Domain accessible via HTTPS

---

## 🚂 Backend Deployment (Railway)

### **Pre-Deployment**
- [ ] `railway.json` configuration file exists in `backend/`
- [ ] `Procfile` exists (backup for Railway)
- [ ] `.dockerignore` configured
- [ ] Build works locally: `npm run build`
- [ ] Start command works: `npm start`
- [ ] Health check endpoint responds: `/health`

### **Railway Setup**
- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added to project
- [ ] Build settings configured:
  - [ ] Build Command: `npm run build`
  - [ ] Start Command: `npm start`
  - [ ] Root Directory: `backend`

### **Environment Variables (Railway Dashboard)**
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL=<automatically-set-by-railway>`
- [ ] `CORS_ORIGIN=<vercel-frontend-url>`
- [ ] `FRONTEND_URL=<vercel-frontend-url>`
- [ ] All required variables from `.env.production.example`

### **Database Setup**
- [ ] PostgreSQL service running
- [ ] Database schema migrated (run `database-schema.sql`)
- [ ] Database connection tested
- [ ] Sample data added (optional)

### **Deployment**
- [ ] First deployment successful
- [ ] Backend accessible at Railway URL
- [ ] Health check responds: `https://<backend-url>/health`
- [ ] Health check returns 200 status
- [ ] Database connection confirmed in health check
- [ ] No errors in Railway logs

---

## 🔐 Security

### **Environment Variables**
- [ ] No secrets in code repository
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets different from development
- [ ] Strong passwords for database (if self-hosted)
- [ ] API keys rotated and secure

### **CORS Configuration**
- [ ] `CORS_ORIGIN` set to production frontend URL only
- [ ] No wildcards (`*`) in production CORS settings
- [ ] Credentials enabled only if needed

### **HTTPS**
- [ ] Frontend uses HTTPS (Vercel automatic)
- [ ] Backend uses HTTPS (Railway automatic)
- [ ] No mixed content warnings
- [ ] Security headers configured (in `vercel.json`)

---

## 🧪 Post-Deployment Testing

### **Frontend Testing**
- [ ] Home page loads
- [ ] All routes accessible
- [ ] No 404 errors (SPA routing works)
- [ ] Dark/Light mode toggle works
- [ ] Theme persists on page reload
- [ ] No console errors
- [ ] No broken images/assets
- [ ] Mobile responsive (test on phone)

### **Backend Testing**
- [ ] Health check endpoint: `GET /health` returns 200
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] CORS allows frontend requests
- [ ] Error handling works (test invalid requests)
- [ ] Rate limiting (if implemented)

### **Integration Testing**
- [ ] Frontend can call backend API
- [ ] CORS headers correct
- [ ] Authentication works (when implemented)
- [ ] Create OST tree works
- [ ] Add nodes works
- [ ] Update nodes works
- [ ] Delete nodes works
- [ ] Export to PNG works
- [ ] Export to PDF works

### **Performance Testing**
- [ ] Page load time <3 seconds
- [ ] API response time <500ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Bundle size reasonable

---

## 📊 Monitoring Setup

### **Vercel Analytics**
- [ ] Analytics enabled in Vercel dashboard
- [ ] Web Vitals tracking active
- [ ] Error tracking configured

### **Railway Monitoring**
- [ ] Metrics tab reviewed
- [ ] CPU usage acceptable (<80%)
- [ ] Memory usage acceptable (<80%)
- [ ] Disk usage acceptable (<80%)

### **Health Monitoring**
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Monitor `/health` endpoint every 5 minutes
- [ ] Email/SMS alerts configured for downtime

### **Error Tracking (Optional)**
- [ ] Sentry configured (optional)
- [ ] Error notifications set up
- [ ] Source maps uploaded

---

## 🔄 Continuous Deployment

### **Automatic Deployments**
- [ ] Vercel auto-deploys on `main` branch push
- [ ] Railway auto-deploys on `main` branch push
- [ ] Preview deployments for pull requests (Vercel)
- [ ] Deployment notifications configured (Slack, Discord, email)

### **Rollback Plan**
- [ ] Know how to rollback Vercel deployment
- [ ] Know how to rollback Railway deployment
- [ ] Database backup strategy in place
- [ ] Tested rollback procedure

---

## 📝 Documentation

### **User Documentation**
- [ ] README.md updated with deployment info
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Architecture diagram updated (optional)

### **Team Documentation**
- [ ] Deployment guide accessible to team
- [ ] Access credentials shared securely
- [ ] Runbook created for common issues
- [ ] Contact information for services (Vercel, Railway)

---

## 🎉 Launch

### **Pre-Launch**
- [ ] All checklist items above completed
- [ ] Stakeholders notified of launch
- [ ] Support plan in place
- [ ] Monitoring active

### **Launch Day**
- [ ] Final deployment to production
- [ ] Smoke tests passed
- [ ] Monitoring dashboard open
- [ ] Team available for support

### **Post-Launch**
- [ ] Monitor for errors (first 24 hours)
- [ ] Check analytics/usage
- [ ] Gather user feedback
- [ ] Address critical issues immediately
- [ ] Plan next iteration

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ Frontend is accessible via HTTPS
- ✅ Backend API is responding
- ✅ Database is connected and operational
- ✅ Health check returns healthy status
- ✅ All core features work:
  - Create OST trees
  - Add/edit/delete nodes
  - Export to PNG/PDF
  - Dark/Light mode toggle
- ✅ No critical errors in logs
- ✅ Performance meets targets
- ✅ Monitoring is active

---

## 🆘 Troubleshooting

If deployment fails, check:
1. Build logs in Vercel/Railway dashboard
2. Environment variables are set correctly
3. Database connection string is correct
4. CORS settings allow frontend domain
5. Health check endpoint responds
6. Node version compatibility
7. Dependencies installed correctly

Refer to `DEPLOYMENT.md` for detailed troubleshooting steps.

---

**Last Updated**: October 1, 2025  
**Use this checklist before every production deployment** ✅



