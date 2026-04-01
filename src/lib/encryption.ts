/**
 * AES-GCM encryption utility for secure API key storage
 * Uses Web Crypto API with user ID as key derivation source
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT = 'job-tracker-salt-v1'; // Static salt for key derivation

/**
 * Derive a cryptographic key from the user ID
 */
async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId + SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string using AES-GCM
 * @param plaintext - The text to encrypt
 * @param userId - User ID used for key derivation
 * @returns Base64 encoded encrypted string (iv + ciphertext)
 */
export async function encrypt(plaintext: string, userId: string): Promise<string> {
  const key = await deriveKey(userId);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a string using AES-GCM
 * @param encryptedBase64 - Base64 encoded encrypted string
 * @param userId - User ID used for key derivation
 * @returns Decrypted plaintext
 */
export async function decrypt(encryptedBase64: string, userId: string): Promise<string> {
  try {
    const key = await deriveKey(userId);
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. The key may have changed.');
  }
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
