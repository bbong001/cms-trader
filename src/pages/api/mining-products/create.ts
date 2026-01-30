import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const product = await prisma.miningProduct.create({
      data: {
        hashRate: body.hashRate,
        currency: body.currency || 'USDT',
        averageDailyReturn: body.averageDailyReturn,
        minimumPurchase: body.minimumPurchase,
        maximumPurchase: body.maximumPurchase || null,
        duration: body.duration || 30,
        status: body.status || 'ACTIVE',
      },
    });

    return new Response(
      JSON.stringify({ data: product }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

