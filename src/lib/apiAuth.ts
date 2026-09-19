import { NextRequest } from 'next/server';
import { verifyAdminSession, SESSION_COOKIE_NAME } from '@/lib/auth';

/** Returns true if the incoming API request carries a valid admin session cookie. */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}
