import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallets: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        contractPositions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
        withdrawalRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        transfers: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        exchangeTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            wallets: true,
            orders: true,
            contractPositions: true,
            tradeFills: true,
            ieoInvestments: true,
            miningInvestments: true,
            withdrawalRequests: true,
            transfers: true,
            exchangeTransactions: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: user }),
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
    
    // Don't allow updating password hash directly
    const { passwordHash, ...updateData } = body;
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new Response(
      JSON.stringify({ data: user }),
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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    await prisma.user.delete({
      where: { id },
    });

    return new Response(
      JSON.stringify({ success: true }),
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

