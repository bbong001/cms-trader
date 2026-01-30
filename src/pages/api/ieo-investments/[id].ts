import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const investment = await prisma.iEOInvestment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true } },
        product: { select: { id: true, title: true, symbol: true } },
      },
    });

    if (!investment) {
      return new Response(
        JSON.stringify({ error: 'Investment not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: investment }),
      {
        status: 200,
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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    
    const investment = await prisma.iEOInvestment.update({
      where: { id },
      data: {
        amount: body.amount,
        tokens: body.tokens,
        status: body.status,
      },
    });

    return new Response(
      JSON.stringify({ data: investment }),
      {
        status: 200,
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

