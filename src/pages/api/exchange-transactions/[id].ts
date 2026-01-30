import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const transaction = await prisma.exchangeTransaction.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'Exchange transaction not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: transaction }),
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
    
    const transaction = await prisma.exchangeTransaction.update({
      where: { id },
      data: {
        fromAsset: body.fromAsset,
        toAsset: body.toAsset,
        fromAmount: body.fromAmount,
        toAmount: body.toAmount,
        rate: body.rate,
        feeAsset: body.feeAsset,
        feeAmount: body.feeAmount,
      },
    });

    return new Response(
      JSON.stringify({ data: transaction }),
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

