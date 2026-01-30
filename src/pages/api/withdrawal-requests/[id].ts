import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const request = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: request }),
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
    
    const withdrawalRequest = await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        asset: body.asset,
        chain: body.chain,
        address: body.address,
        amount: body.amount,
        fee: body.fee,
        arrival: body.arrival,
        status: body.status,
        txHash: body.txHash || null,
      },
    });

    return new Response(
      JSON.stringify({ data: withdrawalRequest }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

