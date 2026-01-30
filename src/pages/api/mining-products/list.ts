import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tokenSymbol: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
        { id: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
    }

    const orderBy: any = {};
    const validSortFields = ['id', 'name', 'tokenSymbol', 'price', 'totalSupply', 'status', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.miningProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: { select: { investments: true } },
        },
      }),
      prisma.miningProduct.count({ where }),
    ]);

    return new Response(
      JSON.stringify({
        data: products,
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

