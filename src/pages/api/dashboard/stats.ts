import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async () => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic counts
    const [
      totalUsers,
      totalWallets,
      totalOrders,
      totalWithdrawals,
      totalTransfers,
      totalExchangeTransactions,
      totalContractPositions,
      totalIEOProducts,
      totalMiningProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.wallet.count(),
      prisma.spotOrder.count(),
      prisma.withdrawalRequest.count(),
      prisma.transfer.count(),
      prisma.exchangeTransaction.count(),
      prisma.contractPosition.count(),
      prisma.iEOProduct.count(),
      prisma.miningProduct.count(),
    ]);

    // Status-based counts
    const [
      openOrders,
      pendingWithdrawals,
      activeIEOProducts,
      activeMiningProducts,
      openContractPositions,
    ] = await Promise.all([
      prisma.spotOrder.count({ where: { status: { in: ['NEW', 'PARTIALLY_FILLED'] } } }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
      prisma.iEOProduct.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.miningProduct.count({ where: { status: 'ACTIVE' } }),
      prisma.contractPosition.count({ where: { status: 'OPEN' } }),
    ]);

    // Today's statistics
    const [
      newUsersToday,
      ordersToday,
      withdrawalsToday,
      transfersToday,
      exchangeTransactionsToday,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.spotOrder.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.withdrawalRequest.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.transfer.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.exchangeTransaction.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

    // This week's statistics
    const [
      newUsersThisWeek,
      ordersThisWeek,
      withdrawalsThisWeek,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.spotOrder.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.withdrawalRequest.count({ where: { createdAt: { gte: weekStart } } }),
    ]);

    // This month's statistics
    const [
      newUsersThisMonth,
      ordersThisMonth,
      withdrawalsThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.spotOrder.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.withdrawalRequest.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Financial statistics
    const wallets = await prisma.wallet.findMany({
      select: {
        available: true,
        locked: true,
        asset: true,
      },
    });

    const totalBalance = wallets.reduce((acc, w) => {
      const available = Number(w.available);
      const locked = Number(w.locked);
      // Simplified: assume all assets are roughly equal to USDT for total calculation
      // In production, you'd want to convert to a base currency
      return acc + available + locked;
    }, 0);

    // Trading volume (from trade fills)
    const tradeFills = await prisma.tradeFill.findMany({
      where: { createdAt: { gte: todayStart } },
      select: {
        price: true,
        quantity: true,
      },
    });

    const todayVolume = tradeFills.reduce((acc, fill) => {
      return acc + Number(fill.price) * Number(fill.quantity);
    }, 0);

    // Total fees collected today
    const todayFees = tradeFills.reduce((acc, fill) => {
      return acc + Number(fill.feeAmount);
    }, 0);

    // Withdrawal amounts
    const withdrawalStats = await prisma.withdrawalRequest.aggregate({
      _sum: {
        amount: true,
        fee: true,
      },
      where: { status: { in: ['APPROVED', 'SENT'] } },
    });

    const totalWithdrawn = Number(withdrawalStats._sum.amount || 0);
    const totalWithdrawalFees = Number(withdrawalStats._sum.fee || 0);

    return new Response(
      JSON.stringify({
        data: {
          totals: {
            users: totalUsers,
            wallets: totalWallets,
            orders: totalOrders,
            withdrawals: totalWithdrawals,
            transfers: totalTransfers,
            exchangeTransactions: totalExchangeTransactions,
            contractPositions: totalContractPositions,
            ieoProducts: totalIEOProducts,
            miningProducts: totalMiningProducts,
          },
          status: {
            openOrders,
            pendingWithdrawals,
            activeIEOProducts,
            activeMiningProducts,
            openContractPositions,
          },
          today: {
            newUsers: newUsersToday,
            orders: ordersToday,
            withdrawals: withdrawalsToday,
            transfers: transfersToday,
            exchangeTransactions: exchangeTransactionsToday,
            tradingVolume: todayVolume,
            fees: todayFees,
          },
          thisWeek: {
            newUsers: newUsersThisWeek,
            orders: ordersThisWeek,
            withdrawals: withdrawalsThisWeek,
          },
          thisMonth: {
            newUsers: newUsersThisMonth,
            orders: ordersThisMonth,
            withdrawals: withdrawalsThisMonth,
          },
          financial: {
            totalBalance,
            totalWithdrawn,
            totalWithdrawalFees,
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

