import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

/**
 * POST /api/seed-finance-products - Seed finance products into database
 * This endpoint creates sample mining and IEO products
 */
export const POST: APIRoute = async () => {
  try {
    console.log('🌱 Starting seed...');

    // Create Mining Products
    console.log('⛏️ Creating mining products...');
    // Check if products already exist
    const existingMining = await prisma.miningProduct.count();
    const existingIEO = await prisma.iEOProduct.count();
    
    if (existingMining > 0 || existingIEO > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Products already exist in database. Please delete existing products first.',
          existingMining,
          existingIEO,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const miningProducts = await Promise.all([
      prisma.miningProduct.create({
        data: {
          hashRate: '10 TH/s',
          currency: 'USDT',
          averageDailyReturn: 2.5,
          minimumPurchase: 100,
          maximumPurchase: 10000,
          duration: 30,
          status: 'ACTIVE',
        },
      }),
      prisma.miningProduct.create({
        data: {
          hashRate: '50 TH/s',
          currency: 'USDT',
          averageDailyReturn: 3.0,
          minimumPurchase: 500,
          maximumPurchase: 50000,
          duration: 60,
          status: 'ACTIVE',
        },
      }),
      prisma.miningProduct.create({
        data: {
          hashRate: '100 TH/s',
          currency: 'USDT',
          averageDailyReturn: 3.5,
          minimumPurchase: 1000,
          maximumPurchase: 100000,
          duration: 90,
          status: 'ACTIVE',
        },
      }),
      prisma.miningProduct.create({
        data: {
          hashRate: '200 TH/s',
          currency: 'USDT',
          averageDailyReturn: 4.0,
          minimumPurchase: 2000,
          maximumPurchase: null,
          duration: 120,
          status: 'ACTIVE',
        },
      }),
      prisma.miningProduct.create({
        data: {
          hashRate: '500 TH/s',
          currency: 'USDT',
          averageDailyReturn: 5.0,
          minimumPurchase: 5000,
          maximumPurchase: null,
          duration: 180,
          status: 'ACTIVE',
        },
      }),
    ]);

    // Create IEO Products
    console.log('🚀 Creating IEO products...');
    const now = new Date();
    const startDate1 = new Date(now);
    startDate1.setDate(startDate1.getDate() - 5);
    const endDate1 = new Date(now);
    endDate1.setDate(endDate1.getDate() + 25);

    const startDate2 = new Date(now);
    startDate2.setDate(startDate2.getDate() - 10);
    const endDate2 = new Date(now);
    endDate2.setDate(endDate2.getDate() + 20);

    const startDate3 = new Date(now);
    startDate3.setDate(startDate3.getDate() + 5);
    const endDate3 = new Date(now);
    endDate3.setDate(endDate3.getDate() + 35);

    const ieoProducts = await Promise.all([
      prisma.iEOProduct.create({
        data: {
          title: 'Bitcoin Mining Token',
          symbol: 'BMT',
          status: 'IN_PROGRESS',
          totalSupply: 1000000,
          currentRaised: 350000,
          pricePerToken: 0.5,
          startDate: startDate1,
          endDate: endDate1,
        },
      }),
      prisma.iEOProduct.create({
        data: {
          title: 'Ethereum Staking Token',
          symbol: 'EST',
          status: 'IN_PROGRESS',
          totalSupply: 2000000,
          currentRaised: 1200000,
          pricePerToken: 0.8,
          startDate: startDate2,
          endDate: endDate2,
        },
      }),
      prisma.iEOProduct.create({
        data: {
          title: 'DeFi Yield Token',
          symbol: 'DYT',
          status: 'UPCOMING',
          totalSupply: 5000000,
          currentRaised: 0,
          pricePerToken: 0.2,
          startDate: startDate3,
          endDate: endDate3,
        },
      }),
      prisma.iEOProduct.create({
        data: {
          title: 'AI Trading Token',
          symbol: 'AIT',
          status: 'IN_PROGRESS',
          totalSupply: 3000000,
          currentRaised: 1800000,
          pricePerToken: 1.2,
          startDate: startDate1,
          endDate: endDate1,
        },
      }),
      prisma.iEOProduct.create({
        data: {
          title: 'Metaverse Land Token',
          symbol: 'MLT',
          status: 'IN_PROGRESS',
          totalSupply: 10000000,
          currentRaised: 4500000,
          pricePerToken: 0.15,
          startDate: startDate2,
          endDate: endDate2,
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Products seeded successfully',
        miningProducts: miningProducts.length,
        ieoProducts: ieoProducts.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to seed products',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
