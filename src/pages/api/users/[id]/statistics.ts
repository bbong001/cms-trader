import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all user data
    const [
      user,
      wallets,
      orders,
      tradeFills,
      contractPositions,
      withdrawals,
      transfers,
      exchangeTransactions,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.wallet.findMany({ where: { userId: id } }),
      prisma.spotOrder.findMany({ where: { userId: id } }),
      prisma.tradeFill.findMany({ where: { userId: id } }),
      prisma.contractPosition.findMany({ where: { userId: id } }),
      prisma.withdrawalRequest.findMany({ where: { userId: id } }),
      prisma.transfer.findMany({ where: { userId: id } }),
      prisma.exchangeTransaction.findMany({ where: { userId: id } }),
    ]);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate statistics
    const totalBalance = wallets.reduce((sum, w) => {
      return sum + parseFloat(w.available.toString()) + parseFloat(w.locked.toString());
    }, 0);

    const totalTradingVolume = tradeFills.reduce((sum, fill) => {
      return sum + parseFloat(fill.price.toString()) * parseFloat(fill.quantity.toString());
    }, 0);

    const totalFees = tradeFills.reduce((sum, fill) => {
      return sum + parseFloat(fill.feeAmount.toString());
    }, 0);

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'APPROVED' || w.status === 'SENT')
      .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);

    const totalDeposited = transfers
      .filter(t => t.toAccount === 'coins')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    // Contract positions statistics
    const closedPositions = contractPositions.filter(p => p.status === 'CLOSED');
    const winPositions = closedPositions.filter(p => p.result === 'WIN');
    const lossPositions = closedPositions.filter(p => p.result === 'LOSS');
    const totalProfit = closedPositions.reduce((sum, p) => {
      return sum + (p.actualProfit ? parseFloat(p.actualProfit.toString()) : 0);
    }, 0);

    // Today's statistics
    const todayTrades = tradeFills.filter(f => new Date(f.createdAt) >= todayStart);
    const todayVolume = todayTrades.reduce((sum, fill) => {
      return sum + parseFloat(fill.price.toString()) * parseFloat(fill.quantity.toString());
    }, 0);

    // This week's statistics
    const weekTrades = tradeFills.filter(f => new Date(f.createdAt) >= weekStart);
    const weekVolume = weekTrades.reduce((sum, fill) => {
      return sum + parseFloat(fill.price.toString()) * parseFloat(fill.quantity.toString());
    }, 0);

    // This month's statistics
    const monthTrades = tradeFills.filter(f => new Date(f.createdAt) >= monthStart);
    const monthVolume = monthTrades.reduce((sum, fill) => {
      return sum + parseFloat(fill.price.toString()) * parseFloat(fill.quantity.toString());
    }, 0);

    return new Response(
      JSON.stringify({
        data: {
          user,
          summary: {
            totalBalance,
            totalTradingVolume,
            totalFees,
            totalWithdrawn,
            totalDeposited,
            totalProfit,
          },
          trading: {
            totalOrders: orders.length,
            totalTrades: tradeFills.length,
            totalVolume: totalTradingVolume,
            totalFees,
            todayVolume,
            weekVolume,
            monthVolume,
          },
          contracts: {
            totalPositions: contractPositions.length,
            openPositions: contractPositions.filter(p => p.status === 'OPEN').length,
            closedPositions: closedPositions.length,
            winPositions: winPositions.length,
            lossPositions: lossPositions.length,
            winRate: closedPositions.length > 0 
              ? (winPositions.length / closedPositions.length) * 100 
              : 0,
            totalProfit,
          },
          wallets: {
            count: wallets.length,
            totalBalance,
            assets: wallets.map(w => ({
              asset: w.asset,
              available: parseFloat(w.available.toString()),
              locked: parseFloat(w.locked.toString()),
              total: parseFloat(w.available.toString()) + parseFloat(w.locked.toString()),
            })),
          },
          activity: {
            totalWithdrawals: withdrawals.length,
            totalTransfers: transfers.length,
            totalExchangeTransactions: exchangeTransactions.length,
            pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING').length,
          },
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

