# Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, make sure you have:

1. **MongoDB Atlas Account** (MongoDB Cloud) - Local MongoDB won't work on Vercel
2. **Cloudinary Account** - For image storage
3. **All Environment Variables Ready**

## Required Environment Variables

You need to set these environment variables in your Vercel project settings:

### 1. MongoDB Connection String

**Important:** You cannot use `mongodb://localhost:27017` on Vercel. You must use MongoDB Atlas.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database`)
4. Add network access (allow all IPs: `0.0.0.0/0`)
5. Set this as `MONGODB_URI` in Vercel

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/media_share_app?retryWrites=true&w=majority
```

### 2. JWT Secret

Generate a secure random string for production:
```
JWT_SECRET=your-super-secure-random-string-here
```

### 3. Cloudinary Configuration

Get these from your Cloudinary dashboard:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
   - **Environment**: Production, Preview, Development (check all)
4. Repeat for all variables:
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Deployment Steps

1. **Push your code to GitHub** (already done ✓)

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import from GitHub: `Ahmed786-tech/photo-share`

3. **Configure Environment Variables** (see above)

4. **Deploy**:
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Wait for build to complete

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify MongoDB Atlas connection string is correct

### 500 Errors After Deployment

- Check Vercel function logs
- Verify MongoDB Atlas allows connections from Vercel IPs
- Ensure all environment variables are set correctly

### Database Connection Errors

- Verify MongoDB Atlas cluster is running
- Check network access is set to allow all IPs (`0.0.0.0/0`)
- Verify connection string format is correct

## Local vs Production

- **Local**: Use `.env.local` with `mongodb://localhost:27017`
- **Production (Vercel)**: Use MongoDB Atlas connection string

## Additional Notes

- Vercel automatically runs `pnpm build` (detected from `pnpm-lock.yaml`)
- Environment variables are encrypted and secure
- You can set different values for Production, Preview, and Development environments

