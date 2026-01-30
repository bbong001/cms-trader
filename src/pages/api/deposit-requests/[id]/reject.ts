import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || '0');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid deposit request ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Reject reason is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const depositRequest = await (prisma as any).depositRequest.findUnique({
      where: { id },
    });

    if (!depositRequest) {
      return new Response(
        JSON.stringify({ error: 'Deposit request not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (depositRequest.status !== 'PENDING') {
      return new Response(
        JSON.stringify({ error: 'Deposit request is not pending' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update deposit request status
    await (prisma as any).depositRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectReason: reason.trim(),
        reviewedBy: 0, // Admin ID (0 for admin)
        reviewedAt: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Deposit request rejected' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error rejecting deposit request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

