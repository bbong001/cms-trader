import type { APIRoute } from 'astro';
import { clearAdminSession } from '../../../server/auth';

export const POST: APIRoute = async (context) => {
  clearAdminSession(context);
  
  return new Response(
    JSON.stringify({ success: true, message: 'Logged out successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

