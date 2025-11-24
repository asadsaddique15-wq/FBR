import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}
  //Compares a plain password against a salted hash in a timing-safe way to guard against leaking information. 
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(key, 'hex'), derived);
}
