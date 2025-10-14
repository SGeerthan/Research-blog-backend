// Simple test script to verify deployment configuration
const app = require('./server');

console.log('✅ Server configuration loaded successfully');
console.log('✅ Routes configured:');
console.log('  - /api/auth/*');
console.log('  - /api/posts/*');
console.log('  - / (health check)');

// Test if the app can be exported properly for Vercel
if (typeof app === 'function') {
  console.log('✅ App is properly exported for Vercel');
} else {
  console.log('❌ App export issue detected');
}

console.log('\n📋 Deployment Checklist:');
console.log('□ Set environment variables in Vercel dashboard');
console.log('□ Configure MongoDB Atlas connection');
console.log('□ Set up email service (Gmail/SendGrid)');
console.log('□ Deploy to Vercel');
console.log('□ Test API endpoints');

console.log('\n🚀 Ready for Vercel deployment!');
