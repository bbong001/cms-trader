import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../server/prisma';
import { setAdminSession } from '../../../server/auth';

export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Using type assertion because TypeScript may not recognize the new model until server restart
    const admin = await (prisma as any).admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
      },
    });

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set session cookie
    setAdminSession(context, admin.id);

    // Update last login
    await (prisma as any).admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

