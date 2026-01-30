import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || '0');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid deposit request ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { txHash } = body;

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const depositRequest = await (prisma as any).depositRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!depositRequest) {
      return new Response(
        JSON.stringify({ error: 'Deposit request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (depositRequest.status !== 'PENDING') {
      return new Response(
        JSON.stringify({ error: 'Deposit request is not pending' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update deposit request status
    await (prisma as any).depositRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: 0, // Admin ID (0 for admin)
        reviewedAt: new Date(),
        txHash: txHash || null,
      },
    });

    // Add amount to user's wallet
    // Find or create wallet for the asset
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId_asset: {
          userId: depositRequest.userId,
          asset: depositRequest.asset,
        },
      },
    });

    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          available: {
            increment: depositRequest.amount,
          },
        },
      });
    } else {
      // Create new wallet
      const newWallet = await prisma.wallet.create({
        data: {
          userId: depositRequest.userId,
          asset: depositRequest.asset,
          available: depositRequest.amount,
          locked: 0,
        },
      });
      
      console.log(`✅ Created new wallet ${newWallet.id} for user ${depositRequest.userId}: ${depositRequest.amount} ${depositRequest.asset}`);
    }

    // Update deposit request to COMPLETED
    await (prisma as any).depositRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Deposit request approved and completed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error approving deposit request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

