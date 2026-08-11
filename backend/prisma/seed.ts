import { Role, CustomerType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/utils/db';

async function main() {
  console.log('Starting seed...');

  // 1. Create Roles (Users)
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const users = [
    { email: 'admin@erp.com', name: 'Admin User', role: Role.ADMIN },
    { email: 'sales@erp.com', name: 'Sales User', role: Role.SALES },
    { email: 'warehouse@erp.com', name: 'Warehouse User', role: Role.WAREHOUSE },
    { email: 'accounts@erp.com', name: 'Accounts User', role: Role.ACCOUNTS },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password,
        role: u.role,
      },
    });
  }
  console.log('Seed completed successfully. Admin and staff accounts are ready.');

  console.log('Seeding Customers...');
  const customers = [
    { name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@sharmaenterprises.in', businessName: 'Sharma Enterprises', gstNumber: '27AADCS4208A1Z5', type: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Andheri West, Mumbai', notes: 'High volume buyer' },
    { name: 'Priya Patel', mobile: '9876543211', email: 'sales@pateltrading.co.in', businessName: 'Patel Trading Co.', gstNumber: '24BBBBB0000A1Z5', type: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Navrangpura, Ahmedabad', notes: 'Prompt payments' },
    { name: 'Amit Singh', mobile: '9876543212', email: 'info@singhdistributors.in', businessName: 'Singh Distributors', gstNumber: '07CCCCC0000A1Z5', type: CustomerType.RETAIL, status: CustomerStatus.LEAD, address: 'Connaught Place, New Delhi', notes: 'Needs follow-up for next order' },
    { name: 'Anjali Desai', mobile: '9876543213', email: 'admin@desairetailers.in', businessName: 'Desai Retailers', gstNumber: '29DDDDD0000A1Z5', type: CustomerType.WHOLESALE, status: CustomerStatus.INACTIVE, address: 'Indiranagar, Bangalore', notes: 'Dormant since last year' },
    { name: 'Vikram Reddy', mobile: '9876543214', email: 'procurement@reddywholesale.in', businessName: 'Reddy Wholesale', gstNumber: '36EEEEE0000A1Z5', type: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Banjara Hills, Hyderabad', notes: 'VIP Client' },
  ];

  for (const c of customers) {
    await prisma.customer.create({ data: c });
  }

  console.log('Seeding Products...');
  const products = [
    { name: 'Ergonomic Office Chair', sku: 'CHR-001', category: 'Seating', unitPrice: 8500, currentStock: 45, minStockAlert: 10, imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800' },
    { name: 'Modern Fabric Sofa', sku: 'SFA-002', category: 'Living Room', unitPrice: 35000, currentStock: 12, minStockAlert: 3, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800' },
    { name: 'King Size Bed Frame', sku: 'BED-003', category: 'Bedroom', unitPrice: 42000, currentStock: 8, minStockAlert: 2, imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' },
    { name: 'Solid Wood Dining Table', sku: 'TBL-004', category: 'Dining', unitPrice: 28000, currentStock: 15, minStockAlert: 4, imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=800' },
    { name: 'Glass Coffee Table', sku: 'CTB-005', category: 'Living Room', unitPrice: 12500, currentStock: 25, minStockAlert: 5, imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Minimalist Office Desk', sku: 'DSK-006', category: 'Office', unitPrice: 15000, currentStock: 30, minStockAlert: 8, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800' },
    { name: 'Oak Bookshelf 5-Tier', sku: 'BKS-007', category: 'Storage', unitPrice: 9500, currentStock: 20, minStockAlert: 5, imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800' },
    { name: '2-Door Wardrobe', sku: 'WRD-008', category: 'Bedroom', unitPrice: 22000, currentStock: 10, minStockAlert: 2, imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800' },
    { name: 'Velvet Armchair', sku: 'ARM-009', category: 'Seating', unitPrice: 14000, currentStock: 18, minStockAlert: 4, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bedside Nightstand', sku: 'NST-010', category: 'Bedroom', unitPrice: 4500, currentStock: 50, minStockAlert: 10, imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800' },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Dummy Customers and Products seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
