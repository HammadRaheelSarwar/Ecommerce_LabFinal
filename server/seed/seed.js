require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUser = require('../models/AdminUser');
const Category = require('../models/Category');
const Product = require('../models/Product');
const WebsiteSettings = require('../models/WebsiteSettings');
const HomepageSection = require('../models/HomepageSection');
const Banner = require('../models/Banner');

const { categories } = require('./data/categories');
const { getProducts } = require('./data/products');
const { homepageSections, websiteSettings, banners } = require('./data/homepage');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/all_available');
  console.log('✅ MongoDB connected for seeding');
};

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@allavailable.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.warn('⚠️  ADMIN_PASSWORD not set in .env — skipping admin seed');
    return;
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log('ℹ️  Admin already exists — skipping');
    return;
  }

  await AdminUser.create({ name: 'Admin', email, passwordHash: password, role: 'superadmin' });
  console.log(`✅ Admin seeded: ${email}`);
};

const seedCategories = async () => {
  await Category.deleteMany({});
  const docs = await Category.insertMany(categories);
  console.log(`✅ ${docs.length} categories seeded`);
  return docs;
};

const seedProducts = async (categoryDocs) => {
  await Product.deleteMany({});
  const categoryMap = categoryDocs.reduce((acc, c) => { acc[c.slug] = c._id; return acc; }, {});
  const products = getProducts(categoryMap);
  const docs = await Product.insertMany(products);
  console.log(`✅ ${docs.length} products seeded`);
};

const seedHomepage = async () => {
  await HomepageSection.deleteMany({});
  await HomepageSection.insertMany(homepageSections);
  console.log('✅ Homepage sections seeded');

  let settings = await WebsiteSettings.findOne();
  if (!settings) {
    await WebsiteSettings.create(websiteSettings);
    console.log('✅ Website settings seeded');
  }

  await Banner.deleteMany({});
  await Banner.insertMany(banners);
  console.log('✅ Banners seeded');
};

const runSeed = async () => {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    const fresh = args.includes('--fresh');

    if (fresh) {
      console.log('\n⚠️  Running FRESH seed — this will overwrite all data!\n');
    }

    await seedAdmin();
    const categoryDocs = await seedCategories();
    await seedProducts(categoryDocs);
    await seedHomepage();

    console.log('\n🎉 Seed complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

runSeed();
