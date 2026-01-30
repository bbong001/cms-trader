import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const product = await prisma.miningProduct.findUnique({
      where: { id },
      include: { investments: { include: { user: { select: { id: true, email: true } } } } },
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: product }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    
    const product = await prisma.miningProduct.update({
      where: { id },
      data: {
        hashRate: body.hashRate,
        currency: body.currency,
        averageDailyReturn: body.averageDailyReturn,
        minimumPurchase: body.minimumPurchase,
        maximumPurchase: body.maximumPurchase,
        duration: body.duration,
        status: body.status,
      },
    });

    return new Response(
      JSON.stringify({ data: product }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const product = await prisma.miningProduct.create({
      data: {
        hashRate: body.hashRate,
        currency: body.currency || 'USDT',
        averageDailyReturn: body.averageDailyReturn,
        minimumPurchase: body.minimumPurchase,
        maximumPurchase: body.maximumPurchase,
        duration: body.duration || 30,
        status: body.status || 'ACTIVE',
      },
    });

    return new Response(
      JSON.stringify({ data: product }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

