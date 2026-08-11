import { Request, Response } from 'express';
import prisma from '../utils/db';
import { ChallanStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalProducts = await prisma.product.count();
    const totalChallans = await prisma.salesChallan.count();

    // Calculate last 7 days sales activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentChallans = await prisma.salesChallan.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        status: {
          in: [ChallanStatus.CONFIRMED]
        }
      },
      include: {
        items: true
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartDataMap = new Map<string, number>();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      chartDataMap.set(dayName, 0);
    }

    recentChallans.forEach(challan => {
      const dayName = days[new Date(challan.createdAt).getDay()];
      const challanRevenue = challan.items.reduce((sum, item) => sum + (item.quantity * Number(item.unitPrice)), 0);
      if (chartDataMap.has(dayName)) {
        chartDataMap.set(dayName, chartDataMap.get(dayName)! + challanRevenue);
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([name, sales]) => ({ name, sales }));

    // 1. Calculate Total Revenue
    const allChallans = await prisma.challanItem.findMany({
      where: {
        challan: {
          status: {
            in: [ChallanStatus.CONFIRMED]
          }
        }
      },
      select: { quantity: true, unitPrice: true }
    });
    const totalRevenue = allChallans.reduce((sum, item) => sum + (item.quantity * Number(item.unitPrice)), 0);

    // 2. Low Stock Alerts
    const allProductsAlerts = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true }
    });
    const lowStockProducts = allProductsAlerts
      .filter(p => p.currentStock <= p.minStockAlert)
      .slice(0, 5);

    // 3. Top Customers
    const topCustomersData = await prisma.salesChallan.groupBy({
      by: ['customerId'],
      where: {
        status: {
          in: [ChallanStatus.CONFIRMED]
        }
      },
      _sum: { totalQuantity: true },
      orderBy: { _sum: { totalQuantity: 'desc' } },
      take: 5
    });
    
    const customerDetails = await prisma.customer.findMany({
      where: { id: { in: topCustomersData.map(c => c.customerId) } },
      select: { id: true, name: true, businessName: true }
    });
    
    const topCustomers = topCustomersData.map(c => ({
      customer: customerDetails.find(d => d.id === c.customerId)!,
      totalQuantity: c._sum.totalQuantity || 0
    }));

    res.json({
      totalCustomers,
      totalProducts,
      totalChallans,
      totalRevenue,
      chartData,
      lowStockProducts,
      topCustomers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
