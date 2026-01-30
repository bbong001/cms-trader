import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const product = await prisma.iEOProduct.create({
      data: {
        title: body.title,
        symbol: body.symbol,
        status: body.status || 'UPCOMING',
        totalSupply: body.totalSupply,
        currentRaised: body.currentRaised || 0,
        pricePerToken: body.pricePerToken,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
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

