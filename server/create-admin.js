import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/gigshield';

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  createdAt: Date
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const existingAdmin = await Admin.findOne({ email: 'admin@zenith.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('📧 Email: admin@zenith.com');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@zenith.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      createdAt: new Date()
    });
    
    await admin.save();
    console.log('✅ Admin created in Admin collection!');
    console.log('📧 Email: admin@zenith.com');
    console.log('🔑 Password: Admin@123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();