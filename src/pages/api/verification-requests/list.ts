import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const status = url.searchParams.get('status') || 'ALL';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    let requests, total;
    try {
      [requests, total] = await Promise.all([
        (prisma as any).verificationRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isVerified: true,
              },
            },
          },
        }),
        (prisma as any).verificationRequest.count({ where }),
      ]);
    } catch (error: any) {
      console.error('Error fetching verification requests:', error);
      console.error('Error stack:', error.stack);
      // If the error is about model not found, provide helpful message
      if (error.message?.includes('verificationRequest') || error.message?.includes('undefined') || error.message?.includes('Cannot read')) {
        return new Response(
          JSON.stringify({ 
            error: 'Verification service not available. Please restart the CMS server after running: cd cms && npx prisma generate' 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    console.log(requests)

    return new Response(
      JSON.stringify({
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

