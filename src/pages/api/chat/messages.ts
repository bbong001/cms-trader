import type { APIRoute } from 'astro';
import { prisma } from '../../../server/prisma';

export const GET: APIRoute = async ({ url }) => {
  try {
    const conversationId = parseInt(url.searchParams.get('conversationId') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before');

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const where: any = { conversationId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Mark messages as read if they're from user (admin is reading)
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderType: 'user',
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new Response(
      JSON.stringify({ data: messages.reverse() }),
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
    const { conversationId, content, imageUrl } = body;

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!content && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Content or imageUrl required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: 0, // Admin ID (0 for admin)
        senderType: 'admin',
        content: content || null,
        imageUrl: imageUrl || null,
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return new Response(
      JSON.stringify({ data: message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

