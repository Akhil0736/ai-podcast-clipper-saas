const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@mylo.com',
      password: hashedPassword,
      name: 'Test User',
      credits: 100,
    },
  });
  
  console.log('✅ Test user created!');
  console.log('📧 Email: test@mylo.com');
  console.log('🔑 Password: password123');
  console.log('💰 Credits: 100');
  console.log('\nYou can now login at http://localhost:3000/login');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
