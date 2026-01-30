import type { APIRoute } from 'astro';
import { prisma } from '../../../../server/prisma';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id || '0');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification request ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { rejectReason } = body;

    if (!rejectReason || rejectReason.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Reject reason is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const verificationRequest = await (prisma as any).verificationRequest.findUnique({
      where: { id },
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
        status: 'REJECTED',
        rejectReason: rejectReason.trim(),
        reviewedBy: 0, // Admin ID (0 for admin)
        reviewedAt: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Verification request rejected' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

