import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export interface SessionData {
  user?: any;
  access_token?: string;
  refresh_token?: string;
}

// Generate a deterministic, opaque hash for the cookie name using your secret
const obfuscatedCookieName = crypto
  .createHash('sha256')
  .update((process.env.SECRET_COOKIE_PASSWORD || 'fallback') + '_app_salt')
  .digest('hex')
  .substring(0, 32); // Shorten to 32 chars for a cleaner network tab

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: `_${obfuscatedCookieName}`, 
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
  },
};

export async function getEncryptedSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}