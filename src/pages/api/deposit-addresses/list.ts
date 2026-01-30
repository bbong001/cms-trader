import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const asset = url.searchParams.get('asset');
    const network = url.searchParams.get('network');
    const isActive = url.searchParams.get('isActive');

    const where: any = {};
    if (asset) {
      where.asset = asset;
    }
    if (network) {
      where.network = network;
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const addresses = await (prisma as any).depositAddress.findMany({
      where,
      orderBy: [
        { asset: 'asc' },
        { network: 'asc' },
      ],
    });

    return new Response(
      JSON.stringify({ data: addresses }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching deposit addresses:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

