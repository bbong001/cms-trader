import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user registrations grouped by date
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const growthData: { [key: string]: number } = {};
    users.forEach((user) => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result: Array<{ date: string; count: number; cumulative: number }> = [];
    let cumulative = 0;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const count = growthData[dateStr] || 0;
      cumulative += count;
      result.push({
        date: dateStr,
        count,
        cumulative,
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

