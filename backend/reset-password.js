const https = require('https');
const bcrypt = require('bcrypt');

const SUPABASE_URL = 'https://dbypllqjccsflhvklxaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXBsbHFqY2NzZmxodmtseGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NzE5OCwiZXhwIjoyMDkwNDUzMTk4fQ.i-gRtqvnTvvqd3oV6N0hKKg9A7RzbRDX7fFCoL0TPLo';

async function resetPassword() {
  try {
    console.log('Attempting to reset revan password...');
    
    // Hash new password
    const newHashedPassword = await bcrypt.hash('password', 10);
    
    const updateData = {
      password: newHashedPassword
    };

    const options = {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(
        `${SUPABASE_URL}/rest/v1/users?username=eq.revan`,
        options,
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log('✅ Password for "revan" reset to: password');
              resolve();
            } else {
              console.log('Response status:', res.statusCode);
              console.log('Response:', data);
              reject(new Error(`Status ${res.statusCode}`));
            }
          });
        }
      );

      req.on('error', (err) => {
        console.error('❌ Request error:', err.message);
        reject(err);
      });

      req.write(JSON.stringify(updateData));
      req.end();
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

resetPassword();
