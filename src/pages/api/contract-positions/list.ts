import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ].filter(Boolean);
    }

    const orderBy: any = {};
    const validSortFields = ['id', 'symbol', 'status', 'side', 'entryPrice', 'exitPrice', 'amount', 'createdAt', 'expiresAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [positions, total] = await Promise.all([
      prisma.contractPosition.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, email: true } },
        },
      }),
      prisma.contractPosition.count({ where }),
    ]);

    return new Response(
      JSON.stringify({
        data: positions,
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

