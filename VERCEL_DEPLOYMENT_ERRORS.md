# Vercel Deployment Errors - Complete Fix Guide

## Common Vercel Monorepo Deployment Errors

When deploying a Vite React app from a monorepo (project with `client/` subdirectory), you typically encounter two main errors:

### Error 1: Build Command Failure
**Symptom**: Build fails with error like "Cannot find module" or "Command failed"

**Root Cause**: 
- Vercel runs build commands from the repository root
- The `cd client` command syntax can be unreliable in Vercel's build environment
- Dependencies might not install correctly due to working directory issues

### Error 2: 404 on Static Assets (CSS/JS files)
**Symptom**: 
- Page loads but styles are missing
- Console shows 404 errors for `.js` and `.css` files
- Assets have incorrect paths like `/assets/index-abc123.js` returning 404

**Root Cause**:
- Rewrite rules incorrectly catch static asset requests
- Missing proper routing for assets before SPA fallback
- Base path configuration issues in Vite

## Solutions Applied

### 1. Simplified `vercel.json` Configuration

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why this works**:
- Vercel automatically handles static assets (CSS, JS) before applying rewrites
- Simpler rewrite pattern that doesn't interfere with assets
- Explicitly sets framework to `vite` so Vercel can optimize the build

### 2. Alternative: Set Root Directory in Vercel Dashboard

**Better approach for monorepos:**

1. Go to your Vercel project settings
2. Navigate to **Settings → General → Root Directory**
3. Set Root Directory to: `client`
4. Keep a simple `vercel.json` in the `client/` directory:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Benefits**:
- No need for `cd` commands
- Vercel treats `client/` as the project root
- Simpler configuration
- More reliable builds

## Step-by-Step Fix Instructions

### Option A: Using Root-Level vercel.json (Current Setup)

1. ✅ Already done - `vercel.json` is configured
2. Deploy again to Vercel
3. Check build logs for any remaining errors

### Option B: Using Root Directory Setting (Recommended)

1. Delete or move `vercel.json` from root
2. Keep `client/vercel.json` (already created)
3. In Vercel Dashboard:
   - Project Settings → General
   - Find "Root Directory" field
   - Enter: `client`
   - Save
4. Redeploy

### Option C: Manual Build Command Fix

If build still fails, try this in `vercel.json`:

```json
{
  "buildCommand": "npm install --prefix client && npm run build --prefix client",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Verifying the Fix

After deployment, check:

1. **Homepage loads**: `https://your-app.vercel.app/`
2. **Routes work**: Visit `/dashboard` directly (should work, not 404)
3. **Assets load**: 
   - Open browser DevTools → Network tab
   - Refresh page
   - All `.js` and `.css` files should return 200, not 404
4. **Client-side routing**: 
   - Navigate to different routes
   - Refresh on any route (should still work)

## Additional Configuration Needed

### 1. Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

(Replace with your actual backend URL)

### 2. Node Version (if build fails)

Add to `client/package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Or create `.nvmrc` in `client/` directory:
```
18
```

### 3. CORS Update

Update `server/server.js` to include your Vercel domain:

```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://collegequeuesystem-iy46plqs5-niharbambharoliya15-8732s-projects.vercel.app',
        'https://your-production-domain.vercel.app'
    ],
    credentials: true
}));
```

## Debugging Tips

### Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment
3. Check "Build Logs" tab
4. Look for specific error messages

### Common Build Errors

**Error**: "Cannot find module 'vite'"
- **Fix**: Ensure `package.json` has `vite` in `devDependencies`
- ✅ Already correct in your setup

**Error**: "ENOENT: no such file or directory"
- **Fix**: Build command path issue - use Option B (Root Directory) instead

**Error**: "Command 'cd' not found"
- **Fix**: Use `npm --prefix client` instead of `cd client`

### Check Runtime Errors

1. Open deployed site
2. Open browser DevTools → Console
3. Look for JavaScript errors
4. Check Network tab for failed requests

## Why These Errors Happen

### Monorepo Complexity

Monorepos add complexity because:
- Vercel expects a single project structure
- Build tools need to know where the source code is
- Output directory must be correctly specified

### Vercel's Build Process

```
1. Clone repository
2. Install dependencies (from root or specified directory)
3. Run build command
4. Look for output in outputDirectory
5. Deploy output directory
```

If any step has wrong paths, it fails.

### Asset Path Resolution

Vite builds assets with paths like `/assets/index-abc123.js`
- These are **absolute paths** from root
- Vercel must serve them from the deployed root
- Rewrites should NOT catch these paths
- Vercel handles this automatically IF framework is set to "vite"

## Summary

The two main errors were likely:
1. **Build failing** due to path/command issues in monorepo
2. **Assets 404** due to incorrect rewrite rules or missing framework detection

The fixes:
1. ✅ Simplified `vercel.json` with explicit framework
2. ✅ Created `client/vercel.json` as alternative
3. ✅ Provided Root Directory approach (most reliable)

**Next Steps**: Try deploying again. If errors persist, use Option B (set Root Directory in Vercel dashboard).


