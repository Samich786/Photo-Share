# Quick Vercel Deployment Checklist

## ⚠️ CRITICAL: Environment Variables Required

Your Vercel deployment will **FAIL** if these environment variables are not set in the Vercel dashboard.

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project → **Settings** → **Environment Variables**
3. Add these 5 variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/media_share_app?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 2: Get MongoDB Atlas Connection String

**You CANNOT use `mongodb://localhost:27017` on Vercel!**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (starts with `mongodb+srv://`)
5. Replace `<password>` with your database password
6. Add your database name at the end: `?retryWrites=true&w=majority`
7. In "Network Access", click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

### Step 3: Redeploy

After setting environment variables, trigger a new deployment:
- Go to Vercel dashboard → Your project → "Deployments"
- Click the three dots on the latest deployment → "Redeploy"

Or push a new commit to trigger automatic deployment.

## Common Issues

### Build succeeds but app shows 500 errors
→ Environment variables not set or incorrect

### "MONGODB_URI is not defined" error
→ Add MONGODB_URI in Vercel environment variables

### Database connection timeout
→ Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)

### Image upload fails
→ Verify Cloudinary credentials in Vercel environment variables

## Your Current Environment Variables (from .env.local)

You need to use these values in Vercel:

- **JWT_SECRET**: `hX7!pQ2$kR9@fM3#sL5^tB0&vN8gYdC4wZ`
- **CLOUDINARY_CLOUD_NAME**: `dqjl8ago2`
- **CLOUDINARY_API_KEY**: (check your .env.local file)
- **CLOUDINARY_API_SECRET**: (check your .env.local file)
- **MONGODB_URI**: ⚠️ **MUST be MongoDB Atlas, NOT localhost!**

---

**See VERCEL_DEPLOYMENT.md for detailed instructions**

