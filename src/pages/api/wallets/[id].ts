import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const wallet = await prisma.wallet.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!wallet) {
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: wallet }),
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
    
    const wallet = await prisma.wallet.update({
      where: { id },
      data: {
        available: body.available,
        locked: body.locked,
      },
    });

    return new Response(
      JSON.stringify({ data: wallet }),
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

