import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const userId = url.searchParams.get('userId');
    const orderId = url.searchParams.get('orderId');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (orderId) where.orderId = parseInt(orderId);
    if (search) {
      where.OR = [
        { side: { contains: search, mode: 'insensitive' } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { orderId: isNaN(Number(search)) ? undefined : Number(search) },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ].filter(Boolean);
    }

    const orderBy: any = {};
    const validSortFields = ['id', 'price', 'quantity', 'feeAmount', 'side', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [fills, total] = await Promise.all([
      prisma.tradeFill.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, email: true } },
          order: true,
        },
      }),
      prisma.tradeFill.count({ where }),
    ]);

    return new Response(
      JSON.stringify({
        data: fills,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

