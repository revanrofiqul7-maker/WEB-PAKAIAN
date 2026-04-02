const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://dbypllqjccsflhvklxaj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXBsbHFqY2NzZmxodmtseGFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3NzE5OCwiZXhwIjoyMDkwNDUzMTk4fQ.i-gRtqvnTvvqd3oV6N0hKKg9A7RzbRDX7fFCoL0TPLo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('revan123', 10);
    
    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: 'Revan',
          username: 'revan',
          email: 'revan@example.com',
          password: hashedPassword,
          role: 'customer',
          created_at: new Date()
        }
      ]);

    if (error) {
      console.error('❌ Error inserting user:', error.message);
    } else {
      console.log('✅ User "revan" berhasil ditambahkan ke database!');
      console.log('Username: revan');
      console.log('Password: revan123');
      console.log('\nSekarang Anda bisa login!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

insertUser();
