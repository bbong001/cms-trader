import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';
import { requireAdmin } from '../../../server/auth';

export const GET: APIRoute = async (context) => {
  try {
    const adminResult = requireAdmin(context);
    if (adminResult instanceof Response) {
      return adminResult; // Returns 401 if not authenticated
    }
    const adminId = adminResult;

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const admin = await (prisma as any).admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Admin not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: admin }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching admin info:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

