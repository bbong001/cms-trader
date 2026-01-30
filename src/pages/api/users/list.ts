import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }

    // Filter by status
    const isActive = url.searchParams.get('isActive');
    const isBanned = url.searchParams.get('isBanned');
    const isVerified = url.searchParams.get('isVerified');
    
    if (isActive !== null) where.isActive = isActive === 'true';
    if (isBanned !== null) where.isBanned = isBanned === 'true';
    if (isVerified !== null) where.isVerified = isVerified === 'true';

    const orderBy: any = {};
    const validSortFields = ['id', 'email', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          createdAt: true,
          isActive: true,
          isBanned: true,
          isVerified: true,
          banReason: true,
          bannedAt: true,
          lastLoginAt: true,
          transactionPasswordHash: true,
          _count: {
            select: {
              wallets: true,
              orders: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return new Response(
      JSON.stringify({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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

