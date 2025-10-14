# Registration Issues - Troubleshooting Guide

## ✅ Local Testing Results
- Registration endpoint is working locally
- Database connection is successful
- Email sending is working
- All environment variables are configured

## 🚨 Common Vercel Deployment Issues

### 1. Environment Variables Not Set in Vercel
**Problem**: Registration fails with "Server configuration error"
**Solution**: 
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   JWT_SECRET=your_secure_jwt_secret_here
   SERVER_URL=https://your-app.vercel.app
   CLIENT_URL=https://your-frontend.vercel.app
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
3. Redeploy your application

### 2. MongoDB Atlas Connection Issues
**Problem**: Database connection fails in Vercel
**Solution**:
1. Check MongoDB Atlas Network Access:
   - Add `0.0.0.0/0` to allow all IPs (for Vercel)
   - Or add Vercel's IP ranges
2. Verify connection string format
3. Check if database user has proper permissions

### 3. Email Service Configuration
**Problem**: Email sending fails
**Solution**:
1. For Gmail:
   - Enable 2-factor authentication
   - Generate an App Password (not regular password)
   - Use the App Password in EMAIL_PASS
2. For other providers:
   - Check SMTP settings
   - Verify authentication credentials

### 4. CORS Issues
**Problem**: Frontend can't connect to API
**Solution**:
- Check if CORS is properly configured
- Verify CLIENT_URL matches your frontend domain

## 🔍 Debugging Steps

### Step 1: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on your function
3. Check the logs for error messages

### Step 2: Test API Endpoints
Test your deployed API:
```bash
# Test health check
curl https://your-app.vercel.app/

# Test registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123",
    "confirmPassword": "testpassword123"
  }'
```

### Step 3: Verify Environment Variables
Add this endpoint to check environment variables (remove after debugging):
```javascript
app.get('/debug/env', (req, res) => {
  res.json({
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Missing',
    SERVER_URL: process.env.SERVER_URL ? 'Set' : 'Missing',
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing'
  });
});
```

## 🛠️ Quick Fixes

### Fix 1: Add Error Logging
The registration function now includes comprehensive error logging. Check Vercel logs for specific error messages.

### Fix 2: Environment Variable Validation
The code now checks for required environment variables and returns specific error messages.

### Fix 3: Email Fallback
If email sending fails, the registration still succeeds but includes the verification URL in the response.

## 📞 Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Server configuration error" | Missing JWT_SECRET or SERVER_URL | Set environment variables in Vercel |
| "Email configuration missing" | Missing EMAIL_USER or EMAIL_PASS | Configure email service |
| "Registration failed" | Database or validation error | Check database connection and logs |
| "Email already registered" | User exists | Use different email or login instead |

## 🚀 Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas configured for Vercel IPs
- [ ] Email service configured (Gmail App Password)
- [ ] CORS configured for frontend domain
- [ ] Test registration endpoint
- [ ] Check Vercel function logs
- [ ] Verify email delivery

## 📧 Testing Registration

1. **Test with curl**:
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpassword123",
    "confirmPassword": "testpassword123"
  }'
```

2. **Expected Response**:
```json
{
  "message": "Registration successful, check email to verify"
}
```

3. **If email fails**:
```json
{
  "message": "Registration successful, but email verification failed. Please contact support.",
  "verificationUrl": "https://your-app.vercel.app/api/auth/verify/token"
}
```
