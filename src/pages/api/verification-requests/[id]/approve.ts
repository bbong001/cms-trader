import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id || '0');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification request ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const verificationRequest = await (prisma as any).verificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            isVerified: true,
          },
        },
      },
    });

    if (!verificationRequest) {
      return new Response(
        JSON.stringify({ error: 'Verification request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (verificationRequest.status !== 'PENDING') {
      return new Response(
        JSON.stringify({ error: 'Verification request is not pending' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update verification request status
    await (prisma as any).verificationRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: 0, // Admin ID (0 for admin)
        reviewedAt: new Date(),
      },
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: verificationRequest.userId },
      data: {
        isVerified: true,
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Verification request approved' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

