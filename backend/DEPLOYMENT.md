# Vercel Deployment Guide

## Prerequisites
1. Vercel account
2. MongoDB Atlas account (or other MongoDB hosting)
3. Email service for nodemailer (Gmail, SendGrid, etc.)

## Environment Variables
Set these in your Vercel dashboard:

### Required Variables:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT tokens
- `SERVER_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- `CLIENT_URL` - Your frontend URL
- `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (e.g., 587)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - Your email password or app password

## Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `backend`

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all the required variables listed above

3. **Deploy:**
   - Vercel will automatically deploy when you push to main branch
   - Or manually deploy from the Vercel dashboard

## Important Notes

### File Upload Limitations
- Vercel doesn't support persistent file storage
- Current implementation uses base64 encoding (not recommended for production)
- For production, integrate with cloud storage:
  - AWS S3
  - Cloudinary
  - Google Cloud Storage
  - Azure Blob Storage

### Database
- Use MongoDB Atlas for production
- Ensure your MongoDB cluster allows connections from Vercel's IP ranges

### Email Service
- Gmail: Use App Passwords (not regular password)
- SendGrid: Recommended for production
- Configure your email service to allow SMTP connections

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Posts
- `POST /api/posts` - Create post (protected)
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/my-posts` - Get user's posts (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

## Testing Deployment
1. Check if the API is running: `GET https://your-app.vercel.app/`
2. Test registration endpoint
3. Test login endpoint
4. Test post creation (with file upload)

## Troubleshooting
- Check Vercel function logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection is working
- Check email service configuration

## Cloudinary Setup

Configure Cloudinary to store images and PDFs instead of local storage:

1. Create a Cloudinary account and a Cloud name.
2. Create an API Key and API Secret.
3. Set the following environment variables (e.g., in Vercel project settings or `.env` for local):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. No local static file hosting is required. Uploads are processed in memory and sent directly to Cloudinary.
5. Ensure request body limits are adequate for your use case. Current per-file limit is 10MB via multer.

Data model:
- `images` is an array of objects: `{ url, publicId, filename, mimetype, size }`
- `pdf` is an object: `{ url, publicId, filename, mimetype, size }`

On post update/delete, associated Cloudinary assets are replaced or removed accordingly.