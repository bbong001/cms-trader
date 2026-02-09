import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const position = await prisma.contractPosition.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!position) {
      return new Response(
        JSON.stringify({ error: 'Position not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: position }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT: Chỉnh Win/Loss cho position. Chỉ cho phép khi chưa hết hạn (expiresAt > now).
 * Body: { result: 'WIN' | 'LOSS' }
 * Win = profit = amount (tổng nhận 2*amount). Loss = thua hết amount.
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    const result = body.result as string;

    if (result !== 'WIN' && result !== 'LOSS') {
      return new Response(
        JSON.stringify({ error: 'result must be WIN or LOSS' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const position = await prisma.contractPosition.findUnique({
      where: { id },
    });

    if (!position) {
      return new Response(
        JSON.stringify({ error: 'Position not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(position.expiresAt);
    if (expiresAt <= now) {
      return new Response(
        JSON.stringify({ error: 'Đã hết hạn, không thể chỉnh Win/Loss' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (position.status !== 'OPEN') {
      return new Response(
        JSON.stringify({ error: 'Chỉ chỉnh được lệnh đang OPEN' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const amount = position.amount;
    const actualProfit = result === 'WIN' ? amount : amount.negated();

    const updated = await prisma.$transaction(async (tx: any) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId_asset: { userId: position.userId, asset: 'USDT' } },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: position.userId,
            asset: 'USDT',
            available: 0,
            locked: 0,
          },
        });
      }

      const newLocked = wallet.locked.sub(amount);
      const newAvailable =
        result === 'WIN'
          ? wallet.available.add(amount).add(amount)
          : wallet.available;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { available: newAvailable, locked: newLocked },
      });

      return tx.contractPosition.update({
        where: { id },
        data: {
          status: 'CLOSED',
          result,
          actualProfit,
          exitPrice: position.entryPrice,
          closedAt: now,
        },
      });
    });

    return new Response(
      JSON.stringify({ data: updated }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

