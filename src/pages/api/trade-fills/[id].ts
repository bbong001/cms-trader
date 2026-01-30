import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const tradeFill = await prisma.tradeFill.findUnique({
      where: { id },
      include: {
        user: true,
        order: true,
      },
    });

    if (!tradeFill) {
      return new Response(
        JSON.stringify({ error: 'Trade fill not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: tradeFill }),
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
    
    const tradeFill = await prisma.tradeFill.update({
      where: { id },
      data: {
        price: body.price,
        quantity: body.quantity,
        feeAmount: body.feeAmount,
      },
    });

    return new Response(
      JSON.stringify({ data: tradeFill }),
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

