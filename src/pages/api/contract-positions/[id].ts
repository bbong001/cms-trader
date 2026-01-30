import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const position = await prisma.contractPosition.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!position) {
      return new Response(
        JSON.stringify({ error: 'Position not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: position }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const body = await request.json();
    
    const position = await prisma.contractPosition.update({
      where: { id },
      data: {
        status: body.status,
        result: body.result,
        exitPrice: body.exitPrice,
        actualProfit: body.actualProfit,
        closedAt: body.closedAt ? new Date(body.closedAt) : null,
      },
    });

    return new Response(
      JSON.stringify({ data: position }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

