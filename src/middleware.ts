import type { MiddlewareHandler } from 'astro';
import { getAdminIdFromRequest } from './server/auth';

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Allow access to login page and API auth endpoints
  const pathname = context.url.pathname;
  const isLoginPage = pathname === '/login';
  const isAuthAPI = pathname.startsWith('/api/auth/');
  const isPublicAPI = pathname.startsWith('/api/public/');

  // Check if user is authenticated
  const adminId = getAdminIdFromRequest(context);

  // Redirect to login if not authenticated and trying to access protected routes
  if (!adminId && !isLoginPage && !isAuthAPI && !isPublicAPI) {
    return context.redirect('/login');
  }

  // Redirect to dashboard if authenticated and trying to access login page
  if (adminId && isLoginPage) {
    return context.redirect('/');
  }

  return next();
};

