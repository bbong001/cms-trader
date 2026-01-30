import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!transfer) {
      return new Response(
        JSON.stringify({ error: 'Transfer not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: transfer }),
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
    
    const transfer = await prisma.transfer.update({
      where: { id },
      data: {
        asset: body.asset,
        amount: body.amount,
        fromAccount: body.fromAccount,
        toAccount: body.toAccount,
      },
    });

    return new Response(
      JSON.stringify({ data: transfer }),
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

