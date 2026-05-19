import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Lead from '../models/Lead';

const LEAD_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh',
  'Anjali Desai', 'Rohan Mehta', 'Kavita Nair', 'Arjun Reddy', 'Divya Joshi',
  'Suresh Iyer', 'Pooja Verma', 'Karthik Rajan', 'Meera Kulkarni', 'Sanjay Mishra',
  'Nisha Agarwal', 'Deepak Bhat', 'Ritu Saxena', 'Manish Tiwari', 'Anita Rao',
  'Rajesh Pillai', 'Sunita Choudhary', 'Gaurav Sinha', 'Lakshmi Menon', 'Vivek Chauhan',
  'Swati Pandey', 'Aakash Jain', 'Rekha Bhatt', 'Nikhil Malhotra', 'Tanvi Kapoor',
  'Harish Goyal', 'Shweta Dubey', 'Pranav Sethi', 'Geeta Ranganathan', 'Ashish Parikh',
  'Neha Bansal', 'Siddharth Goel', 'Pallavi Hegde', 'Rakesh Trivedi', 'Jyoti Srivastava',
  'Vishal Dutta', 'Shruti Mahajan', 'Arun Krishnan', 'Bhavna Chawla', 'Sachin Wagh',
  'Manju Bajaj', 'Tushar Kale', 'Radha Mistry', 'Ajay Shetty', 'Usha Naik',
];

const STATUSES: Array<'New' | 'Contacted' | 'Qualified' | 'Lost'> = [
  'New', 'Contacted', 'Qualified', 'Lost',
];

const SOURCES: Array<'Website' | 'Instagram' | 'Referral'> = [
  'Website', 'Instagram', 'Referral',
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = (): Date => {
  const now = Date.now();
  const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
  return new Date(threeMonthsAgo + Math.random() * (now - threeMonthsAgo));
};

const seed = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const salt = await bcrypt.genSalt(12);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@smartleads.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const salesUser1 = await User.create({
      name: 'Ravi Sales',
      email: 'ravi@smartleads.com',
      password: 'Sales@123',
      role: 'sales_user',
    });

    const salesUser2 = await User.create({
      name: 'Priyanka Sales',
      email: 'priyanka@smartleads.com',
      password: 'Sales@123',
      role: 'sales_user',
    });

    console.log('👤 Created users:');
    console.log('   Admin:  admin@smartleads.com / Admin@123');
    console.log('   Sales1: ravi@smartleads.com / Sales@123');
    console.log('   Sales2: priyanka@smartleads.com / Sales@123');

    // Create leads
    const users = [adminUser, salesUser1, salesUser2];
    const leads = LEAD_NAMES.map((name) => {
      const emailName = name.toLowerCase().replace(/\s+/g, '.');
      return {
        name,
        email: `${emailName}@example.com`,
        status: getRandomItem(STATUSES),
        source: getRandomItem(SOURCES),
        createdBy: getRandomItem(users)._id,
        createdAt: getRandomDate(),
        updatedAt: getRandomDate(),
      };
    });

    await Lead.insertMany(leads);
    console.log(`📊 Created ${leads.length} leads`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
