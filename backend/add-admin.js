const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nwztcimjyemzxtikwcwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53enRjaW1qeWVtend0aWt3Y3dsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM5MzcxNSwiZXhwIjoxODkxMTYwMzE1fQ.WuVXAX_zVoqJvCwuupmKVEwLWJA8HcHvVvvVdhyU5iE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdmins() {
  try {
    console.log('🔄 Memulai proses menambah admin...\n');

    // 1. Update existing users menjadi admin
    const usersToUpdate = ['budi', 'ayu', 'sinta'];
    
    for (const username of usersToUpdate) {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('username', username);
      
      if (error) {
        console.log(`❌ Error update ${username}:`, error.message);
      } else {
        console.log(`✅ ${username} sekarang jadi ADMIN`);
      }
    }

    // 2. Tambah admin baru
    const newAdmin = {
      name: 'Admin Master',
      username: 'admin_master',
      email: 'admin@tokopakaian.com',
      password: 'Admin@123456', // Ganti dengan password yang aman
      role: 'admin',
      membership: 'Gold'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([newAdmin])
      .select();

    if (insertError) {
      console.log(`❌ Error insert admin baru:`, insertError.message);
    } else {
      console.log(`✅ Admin baru '${newAdmin.username}' berhasil ditambahkan`);
    }

    console.log('\n✨ Semua admin sudah ditambahkan!');
    console.log('\n📋 Admin yang tersedia sekarang:');
    console.log('');
    console.log('1. Rudi (admin) - Email: Rudi@tokopakaian.com');
    console.log('2. budi (admin) - Email: budi@gmail.com');
    console.log('3. ayu (admin) - Email: ayu@gmail.com');
    console.log('4. sinta (admin) - Email: sinta@tokopakaian.com');
    console.log('5. admin_master (admin) - Email: admin@tokopakaian.com');
    console.log('   Password: Admin@123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addAdmins();
