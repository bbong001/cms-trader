import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const [recentUsers, recentOrders, recentWithdrawals, recentTransfers, recentExchangeTransactions] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.spotOrder.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          symbol: true,
          side: true,
          status: true,
          quantity: true,
          price: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.withdrawalRequest.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          asset: true,
          amount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.transfer.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          asset: true,
          amount: true,
          fromAccount: true,
          toAccount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.exchangeTransaction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fromAsset: true,
          toAsset: true,
          fromAmount: true,
          toAmount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        data: {
          recentUsers,
          recentOrders,
          recentWithdrawals,
          recentTransfers,
          recentExchangeTransactions,
        },
      }),
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

