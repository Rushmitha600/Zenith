import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/gigshield';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  dailyIncome: Number,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const testUser = new User({
      name: 'Test Worker',
      email: 'test@worker.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'worker',
      dailyIncome: 500,
      createdAt: new Date()
    });
    
    await testUser.save();
    console.log('✅ Test user created!');
    console.log('Email: test@worker.com');
    console.log('Password: Test@123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();