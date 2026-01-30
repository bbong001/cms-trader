import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);
    const product = await prisma.iEOProduct.findUnique({
      where: { id },
      include: { investments: { include: { user: { select: { id: true, email: true } } } } },
    });

    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: product }),
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
    
    const product = await prisma.iEOProduct.update({
      where: { id },
      data: {
        title: body.title,
        symbol: body.symbol,
        status: body.status,
        totalSupply: body.totalSupply,
        currentRaised: body.currentRaised,
        pricePerToken: body.pricePerToken,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return new Response(
      JSON.stringify({ data: product }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    const product = await prisma.iEOProduct.create({
      data: {
        title: body.title,
        symbol: body.symbol,
        status: body.status || 'UPCOMING',
        totalSupply: body.totalSupply,
        currentRaised: body.currentRaised || 0,
        pricePerToken: body.pricePerToken,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
    });

    return new Response(
      JSON.stringify({ data: product }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

