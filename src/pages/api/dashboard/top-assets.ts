import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async () => {
  try {
    // Get top assets by wallet balance
    const wallets = await prisma.wallet.groupBy({
      by: ['asset'],
      _sum: {
        available: true,
        locked: true,
      },
      orderBy: {
        _sum: {
          available: 'desc',
        },
      },
      take: 10,
    });

    const topAssets = wallets.map((w) => ({
      asset: w.asset,
      totalAvailable: Number(w._sum.available || 0),
      totalLocked: Number(w._sum.locked || 0),
      total: Number(w._sum.available || 0) + Number(w._sum.locked || 0),
    }));

    return new Response(
      JSON.stringify({
        data: topAssets,
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

