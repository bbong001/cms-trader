import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    const { asset, amount, type, reason } = body; // type: 'add' | 'subtract'

    if (!asset || !amount || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: asset, amount, type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Find or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: {
        userId_asset: {
          userId: id,
          asset: asset,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: id,
          asset: asset,
          available: 0,
          locked: 0,
        },
      });
    }

    const adjustmentAmount = parseFloat(amount);
    const currentAvailable = parseFloat(wallet.available.toString());

    if (type === 'subtract' && currentAvailable < adjustmentAmount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const newAvailable = type === 'add' 
      ? currentAvailable + adjustmentAmount 
      : currentAvailable - adjustmentAmount;

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        available: newAvailable,
      },
    });

    // TODO: Log this transaction in an audit log table

    return new Response(
      JSON.stringify({ 
        data: updatedWallet, 
        message: `Balance ${type === 'add' ? 'added' : 'subtracted'} successfully`,
        adjustment: {
          type,
          amount: adjustmentAmount,
          reason: reason || 'Manual adjustment by administrator',
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

