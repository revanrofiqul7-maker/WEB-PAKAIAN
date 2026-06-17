const https = require('https');
const bcrypt = require('bcrypt');

const SUPABASE_URL = 'https://dbypllqjccsflhvklxaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXBsbHFqY2NzZmxodmtseGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NzE5OCwiZXhwIjoyMDkwNDUzMTk4fQ.i-gRtqvnTvvqd3oV6N0hKKg9A7RzbRDX7fFCoL0TPLo';

async function createUser() {
  try {
    console.log('Creating user "revan"...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('revan123', 10);
    
    const userData = {
      name: 'Revan',
      username: 'revan',
      email: 'revan@example.com',
      password: hashedPassword,
      role: 'customer',
      membership: new Date()
    };

    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(
        `${SUPABASE_URL}/rest/v1/users`,
        options,
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('✅ User "revan" berhasil dibuat!');
                console.log('Username: revan');
                console.log('Password: revan123');
                resolve();
              } else {
                console.log('❌ Error:', result.message || data);
                reject(new Error(result.message || data));
              }
            } catch (e) {
              console.log('❌ Error parsing response:', data);
              reject(e);
            }
          });
        }
      );

      req.on('error', (err) => {
        console.error('❌ Request error:', err.message);
        reject(err);
      });

      req.write(JSON.stringify(userData));
      req.end();
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createUser();
