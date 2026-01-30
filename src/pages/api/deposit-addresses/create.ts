import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { asset, network, address, qrCodeUrl, isActive, minAmount, maxAmount, note } = body;

    if (!asset || !network || !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: asset, network, address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const newAddress = await (prisma as any).depositAddress.create({
      data: {
        asset,
        network,
        address,
        qrCodeUrl: qrCodeUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        minAmount: minAmount || null,
        maxAmount: maxAmount || null,
        note: note || null,
      },
    });

    return new Response(
      JSON.stringify({ data: newAddress }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating deposit address:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return new Response(
        JSON.stringify({ error: 'Deposit address for this asset and network already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

