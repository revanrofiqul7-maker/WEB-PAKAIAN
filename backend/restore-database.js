const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dbypllqjccsflhvklxaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXBsbHFqY2NzZmxodmtseGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzcxOTgsImV4cCI6MjA5MDQ1MzE5OH0.r4Ek8I0By3X8CAmtLAKrImFpehW_DOhp7-DsLvlduIs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function restoreDatabase() {
  try {
    console.log('🔄 Starting database restore...\n');

    // ==================== CLEAR EXISTING DATA ====================
    console.log('🗑️  Clearing existing data...');
    
    // Delete in order to respect foreign key constraints
    await supabase.from('transaction_items').delete().neq('id', 0);
    await supabase.from('transactions').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);
    await supabase.from('tokens').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);
    
    console.log('✅ Old data cleared\n');

    // ==================== INSERT USERS ====================
    console.log('👥 Inserting users...');
    const users = [
      { name: 'Rudi Hartono', username: 'Rudi', role: 'admin', email: 'Rudi@tokopakaian.com', password: '$2a$10$8CAtPVXmALNAARrcY/v4ce01CVRyL7jV7TtxTGvZHpL4t5NoB19vO', membership: 'Gold' },
      { name: 'Sinta Ayu', username: 'sinta', role: 'kasir', email: 'sinta@tokopakaian.com', password: 'Sinta13', membership: 'Silver' },
      { name: 'Budi Santoso', username: 'budi', role: 'customer', email: 'budi@gmail.com', password: 'budi14', membership: 'Bronze' },
      { name: 'Ayu Lestari', username: 'ayu', role: 'customer', email: 'ayu@gmail.com', password: 'ayu15', membership: 'Silver' }
    ];

    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (usersError) throw usersError;
    console.log(`✅ ${insertedUsers.length} users inserted\n`);

    // ==================== INSERT CATEGORIES ====================
    console.log('📂 Inserting categories...');
    const categories = [
      { category_name: 'Pakaian Pria', description: 'Kaos, kemeja, dan celana pria' },
      { category_name: 'Pakaian Wanita', description: 'Blouse, rok, dan dress wanita' },
      { category_name: 'Anak-anak', description: 'Baju anak-anak berbagai usia' },
      { category_name: 'Aksesoris', description: 'Topi, ikat pinggang, dan syal' }
    ];

    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ ${insertedCategories.length} categories inserted\n`);

    // ==================== INSERT PRODUCTS ====================
    console.log('🛍️  Inserting products...');
    // Get actual category IDs from inserted categories
    const cat1Id = insertedCategories[0].id;
    const cat2Id = insertedCategories[1].id;
    const cat3Id = insertedCategories[2].id;
    const cat4Id = insertedCategories[3].id;

    const products = [
      { name: 'Kaos Polos Pria', description: 'Kaos katun 100%', category_id: cat1Id, price: 75000, stock: 100 },
      { name: 'Kemeja Lengan Panjang', description: 'Kemeja formal pria', category_id: cat1Id, price: 120000, stock: 50 },
      { name: 'Celana Jeans', description: 'Jeans biru slim fit', category_id: cat1Id, price: 180000, stock: 40 },
      { name: 'Blouse Wanita', description: 'Blouse lengan pendek', category_id: cat2Id, price: 95000, stock: 60 },
      { name: 'Dress Casual', description: 'Dress santai dengan motif bunga', category_id: cat2Id, price: 150000, stock: 45 },
      { name: 'Kaos Anak Laki', description: 'Kaos gambar kartun', category_id: cat3Id, price: 55000, stock: 70 },
      { name: 'Rok Anak Perempuan', description: 'Rok motif lucu', category_id: cat3Id, price: 65000, stock: 65 },
      { name: 'Topi Baseball', description: 'Topi pria & wanita', category_id: cat4Id, price: 45000, stock: 80 },
      { name: 'Ikat Pinggang Kulit', description: 'Aksesoris kulit asli', category_id: cat4Id, price: 90000, stock: 30 }
    ];

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) throw productsError;
    console.log(`✅ ${insertedProducts.length} products inserted\n`);

    // ==================== INSERT TRANSACTIONS ====================
    console.log('💰 Inserting transactions...');
    // Get actual user IDs from inserted users (skip admin, use customer accounts)
    const user3Id = insertedUsers[2].id;  // budi
    const user4Id = insertedUsers[3].id;  // ayu
    const user2Id = insertedUsers[1].id;  // sinta (cashier)

    const transactions = [
      { customer_id: user3Id, cashier_by: user2Id, discount_applied: 10000, total_amount: 250000 },
      { customer_id: user4Id, cashier_by: user2Id, discount_applied: 5000, total_amount: 145000 }
    ];

    const { data: insertedTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (transactionsError) throw transactionsError;
    console.log(`✅ ${insertedTransactions.length} transactions inserted\n`);

    // ==================== INSERT TRANSACTION ITEMS ====================
    console.log('📦 Inserting transaction items...');
    // Get actual product IDs from inserted products
    const prod1Id = insertedProducts[0].id;
    const prod3Id = insertedProducts[2].id;
    const prod5Id = insertedProducts[4].id;
    const trans1Id = insertedTransactions[0].id;
    const trans2Id = insertedTransactions[1].id;

    const transactionItems = [
      { transaction_id: trans1Id, product_id: prod1Id, quantity: 2, subtotal: 150000 },
      { transaction_id: trans1Id, product_id: prod3Id, quantity: 1, subtotal: 180000 },
      { transaction_id: trans2Id, product_id: prod5Id, quantity: 1, subtotal: 150000 }
    ];

    const { data: insertedItems, error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems)
      .select();

    if (itemsError) throw itemsError;
    console.log(`✅ ${insertedItems.length} transaction items inserted\n`);

    // ==================== VERIFY DATA ====================
    console.log('📊 Verifying restored data...\n');
    
    const { data: allUsers } = await supabase.from('users').select();
    const { data: allProducts } = await supabase.from('products').select();
    const { data: allCategories } = await supabase.from('categories').select();
    const { data: allTransactions } = await supabase.from('transactions').select();

    console.log('📈 Summary:');
    console.log(`  ✅ Users: ${allUsers?.length || 0}`);
    console.log(`  ✅ Categories: ${allCategories?.length || 0}`);
    console.log(`  ✅ Products: ${allProducts?.length || 0}`);
    console.log(`  ✅ Transactions: ${allTransactions?.length || 0}`);
    console.log('\n✨ Database restore completed successfully!\n');

  } catch (error) {
    console.error('❌ Error during restore:', error.message);
    process.exit(1);
  }
}

restoreDatabase();
