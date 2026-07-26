import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 210_000;
const HASH_KEY_LENGTH = 32;
const HASH_PREFIX = "pbkdf2_sha256";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM,
  ).toString("base64url");

  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [prefix, iterations, salt, hash] = storedHash.split("$");

  if (prefix !== HASH_PREFIX || !iterations || !salt || !hash) {
    return false;
  }

  const expectedHash = Buffer.from(hash, "base64url");
  const actualHash = pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    expectedHash.length,
    HASH_ALGORITHM,
  );

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHash);
}
