import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'arb3a_admin_session';
const ALG = 'HS256';

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not set. Add it to your environment variables.');
  }
  return new TextEncoder().encode(secret);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/** Creates a signed session JWT for the admin, valid for 12 hours. */
export async function createAdminSession(): Promise<string> {
  return await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getSecretKey());
}

/** Verifies a session token. Returns true if it's a valid, unexpired admin session. */
export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Checks submitted admin credentials against environment variables.
 * Supports either a plaintext ADMIN_PASSWORD (dev convenience) or a
 * bcrypt-hashed ADMIN_PASSWORD_HASH (recommended for production).
 */
export async function checkAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const expectedPlain = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || (!expectedHash && !expectedPlain)) {
    throw new Error(
      'Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) in your environment.'
    );
  }

  if (username !== expectedUsername) return false;

  if (expectedHash) {
    return await bcrypt.compare(password, expectedHash);
  }
  return password === expectedPlain;
}
