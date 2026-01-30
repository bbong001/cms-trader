import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    const { reason } = body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        banReason: reason || 'Banned by administrator',
        bannedAt: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ data: user, message: 'User banned successfully' }),
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

