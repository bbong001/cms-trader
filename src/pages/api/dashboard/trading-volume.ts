import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get trade fills grouped by date
    const tradeFills = await prisma.tradeFill.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        price: true,
        quantity: true,
        feeAmount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date and calculate volume
    const volumeData: { [key: string]: { volume: number; fees: number } } = {};
    tradeFills.forEach((fill) => {
      const date = new Date(fill.createdAt).toISOString().split('T')[0];
      const volume = Number(fill.price) * Number(fill.quantity);
      const fees = Number(fill.feeAmount);
      
      if (!volumeData[date]) {
        volumeData[date] = { volume: 0, fees: 0 };
      }
      volumeData[date].volume += volume;
      volumeData[date].fees += fees;
    });

    // Fill in missing dates with 0
    const result: Array<{ date: string; volume: number; fees: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const data = volumeData[dateStr] || { volume: 0, fees: 0 };
      result.push({
        date: dateStr,
        volume: data.volume,
        fees: data.fees,
      });
    }

    return new Response(
      JSON.stringify({
        data: result,
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

