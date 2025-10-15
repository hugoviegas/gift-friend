import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16; // 128 bits

interface EncryptedData {
  iv: string;
  ciphertext: string;
  authTag: string;
  salt: string;
}

/**
 * Get encryption key from environment
 * Falls back to a generated key if not available (for development)
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;

  if (!keyEnv) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not defined. Please set it in .env.local"
    );
  }

  // The key should be 64 hex characters (32 bytes for AES-256)
  if (keyEnv.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be 64 hex characters (32 bytes for AES-256). " +
        `Current length: ${keyEnv.length}`
    );
  }

  try {
    return Buffer.from(keyEnv, "hex");
  } catch (error) {
    throw new Error(
      "ENCRYPTION_KEY must be valid hex string. " + String(error)
    );
  }
}

/**
 * Encrypt data using AES-256-GCM with a random IV
 * Returns an object containing IV, ciphertext, auth tag, and salt (all as hex strings)
 *
 * @param plaintext - The data to encrypt
 * @returns Encrypted data object with IV, ciphertext, authTag, and salt
 * @throws Error if encryption key is not available or invalid
 *
 * @example
 * const data = encrypt("secret-santa-assignment-123");
 * // { iv: "...", ciphertext: "...", authTag: "...", salt: "..." }
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();

  // Generate random IV (Initialization Vector)
  const iv = crypto.randomBytes(IV_LENGTH);

  // Generate random salt (for key derivation, though we're using static key here)
  const salt = crypto.randomBytes(SALT_LENGTH);

  try {
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the plaintext
    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString("hex"),
      ciphertext,
      authTag: authTag.toString("hex"),
      salt: salt.toString("hex"),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${String(error)}`);
  }
}

/**
 * Decrypt data encrypted with the encrypt function
 * Requires the full encrypted data object from encrypt()
 *
 * @param encrypted - The encrypted data object with IV, ciphertext, authTag, and salt
 * @returns The decrypted plaintext string
 * @throws Error if decryption fails, auth tag verification fails, or key is invalid
 *
 * @example
 * const encrypted = encrypt("secret-assignment");
 * const original = decrypt(encrypted);
 * // "secret-assignment"
 */
export function decrypt(encrypted: EncryptedData): string {
  const key = getEncryptionKey();

  try {
    // Convert hex strings back to buffers
    const iv = Buffer.from(encrypted.iv, "hex");
    const authTag = Buffer.from(encrypted.authTag, "hex");
    const ciphertext = encrypted.ciphertext;

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Set the authentication tag for verification
    decipher.setAuthTag(authTag);

    // Decrypt
    let plaintext = decipher.update(ciphertext, "hex", "utf8");
    plaintext += decipher.final("utf8");

    return plaintext;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${String(
        error
      )}. This usually means the data is corrupted or the encryption key has changed.`
    );
  }
}

/**
 * Encrypt a JSON object to a string
 * Useful for encrypting structured data like assignments
 *
 * @param data - The data object to encrypt
 * @returns JSON string containing encrypted data object
 * @throws Error if encryption fails or data is not serializable
 *
 * @example
 * const assignment = { recipientId: "user-123", giftBudget: 50 };
 * const encrypted = encryptJSON(assignment);
 * // '{"iv":"...","ciphertext":"...","authTag":"...","salt":"..."}'
 */
export function encryptJSON(data: unknown): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = encrypt(jsonString);
    return JSON.stringify(encrypted);
  } catch (error) {
    throw new Error(`JSON encryption failed: ${String(error)}`);
  }
}

/**
 * Decrypt a JSON object from an encrypted string
 * Reverses the encryptJSON operation
 *
 * @param encryptedJSON - The encrypted JSON string from encryptJSON()
 * @returns The decrypted data object
 * @throws Error if decryption fails or JSON parsing fails
 *
 * @example
 * const encrypted = encryptJSON({ recipientId: "user-123" });
 * const original = decryptJSON(encrypted);
 * // { recipientId: "user-123" }
 */
export function decryptJSON<T = unknown>(encryptedJSON: string): T {
  try {
    const encrypted = JSON.parse(encryptedJSON) as EncryptedData;
    const jsonString = decrypt(encrypted);
    const data = JSON.parse(jsonString) as T;
    return data;
  } catch (error) {
    throw new Error(`JSON decryption failed: ${String(error)}`);
  }
}

/**
 * Utility function to generate a secure random encryption key
 * Use this ONCE during setup and store the output in your ENCRYPTION_KEY env variable
 *
 * @returns A 64-character hex string suitable for ENCRYPTION_KEY
 *
 * @example
 * const key = generateEncryptionKey();
 * // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
 * // Copy this to your .env.local as ENCRYPTION_KEY=<value>
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(32); // 32 bytes = 256 bits for AES-256
  return key.toString("hex");
}

/**
 * Hash a value for storage (e.g., for comparing without storing plaintext)
 * Uses SHA-256 with a salt from the encryption key
 *
 * @param value - The value to hash
 * @returns The hashed value as a hex string
 *
 * @example
 * const hashedEmail = hashValue("user@example.com");
 * // Can be used for deduplication checks without storing plaintext
 */
export function hashValue(value: string): string {
  const key = getEncryptionKey();
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(value);
  return hmac.digest("hex");
}
