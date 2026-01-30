import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const userId = url.searchParams.get('userId');
    const productId = url.searchParams.get('productId');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (productId) where.productId = parseInt(productId);
    if (search) {
      where.OR = [
        { status: { contains: search, mode: 'insensitive' } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
        { productId: isNaN(Number(search)) ? undefined : Number(search) },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ].filter(Boolean);
    }

    const orderBy: any = {};
    const validSortFields = ['id', 'amount', 'tokens', 'status', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [investments, total] = await Promise.all([
      prisma.miningInvestment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, email: true } },
          product: true,
        },
      }),
      prisma.miningInvestment.count({ where }),
    ]);

    return new Response(
      JSON.stringify({
        data: investments,
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

