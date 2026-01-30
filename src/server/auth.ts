import type { APIContext } from 'astro';

/**
 * Extract adminId from session cookie
 * Returns null if invalid or missing
 */
export function getAdminIdFromRequest(context: APIContext): number | null {
  const sessionId = context.cookies.get('cms-session')?.value;
  if (!sessionId) {
    return null;
  }

  // Simple session format: "admin-{adminId}"
  if (!sessionId.startsWith('admin-')) {
    return null;
  }

  const adminIdStr = sessionId.substring(6); // Remove "admin-"
  const adminId = parseInt(adminIdStr, 10);

  if (isNaN(adminId) || adminId <= 0) {
    return null;
  }

  return adminId;
}

/**
 * Middleware helper: returns adminId or sends 401 response
 */
export function requireAdmin(context: APIContext): number | Response {
  const adminId = getAdminIdFromRequest(context);
  
  if (!adminId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return adminId;
}

/**
 * Set admin session cookie
 */
export function setAdminSession(context: APIContext, adminId: number): void {
  context.cookies.set('cms-session', `admin-${adminId}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear admin session cookie
 */
export function clearAdminSession(context: APIContext): void {
  context.cookies.delete('cms-session', {
    path: '/',
  });
}

