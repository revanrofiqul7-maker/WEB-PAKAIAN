const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dbypllqjccsflhvklxaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXBsbHFqY2NzZmxodmtseGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzcxOTgsImV4cCI6MjA5MDQ1MzE5OH0.r4Ek8I0By3X8CAmtLAKrImFpehW_DOhp7-DsLvlduIs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
  console.log('=== Checking Data di Supabase ===\n');
  
  try {
    // Check users
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    console.log('📦 USERS (' + (users?.length || 0) + '):');
    if (users?.length) {
      users.forEach(u => console.log('  - ' + u.username + ' (' + u.email + ')'));
    } else {
      console.log('  (kosong)');
    }
    
    // Check products
    const { data: products, error: productsError } = await supabase.from('products').select('*');
    console.log('\n📦 PRODUCTS (' + (products?.length || 0) + '):');
    if (products?.length) {
      products.forEach(p => console.log('  - ' + p.name + ' (Rp' + p.price + ')'));
    } else {
      console.log('  (kosong)');
    }
    
    // Check categories
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    console.log('\n📦 CATEGORIES (' + (categories?.length || 0) + '):');
    if (categories?.length) {
      categories.forEach(c => console.log('  - ' + c.category_name));
    } else {
      console.log('  (kosong)');
    }
    
    // Check transactions
    const { data: transactions, error: transError } = await supabase.from('transactions').select('*');
    console.log('\n📦 TRANSACTIONS (' + (transactions?.length || 0) + ')');
    
    console.log('\n✅ Check selesai!');
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkData();
