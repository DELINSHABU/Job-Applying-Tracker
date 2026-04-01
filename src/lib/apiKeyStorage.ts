/**
 * Secure API key storage using encrypted localStorage
 * Keys are encrypted with AES-GCM using the user's Firebase UID
 */

import { encrypt, decrypt, isCryptoAvailable } from './encryption';
import type { AIProvider } from '../types';

const STORAGE_KEY_PREFIX = 'jt_api_key_';

/**
 * Get the storage key for a specific provider
 */
function getStorageKey(provider: AIProvider): string {
  return `${STORAGE_KEY_PREFIX}${provider}`;
}

/**
 * Save an API key securely
 * @param provider - The AI provider (gemini, openai, etc.)
 * @param apiKey - The API key to store
 * @param userId - User ID for encryption
 */
export async function saveApiKey(
  provider: AIProvider,
  apiKey: string,
  userId: string
): Promise<void> {
  if (!isCryptoAvailable()) {
    console.warn('Web Crypto API not available, storing key with basic encoding');
    localStorage.setItem(getStorageKey(provider), btoa(apiKey));
    return;
  }

  const encrypted = await encrypt(apiKey, userId);
  localStorage.setItem(getStorageKey(provider), encrypted);
}

/**
 * Retrieve an API key
 * @param provider - The AI provider
 * @param userId - User ID for decryption
 * @returns The decrypted API key or null if not found
 */
export async function getApiKey(
  provider: AIProvider,
  userId: string
): Promise<string | null> {
  const stored = localStorage.getItem(getStorageKey(provider));
  if (!stored) return null;

  if (!isCryptoAvailable()) {
    // Fallback: try to decode as base64
    try {
      return atob(stored);
    } catch {
      return null;
    }
  }

  try {
    return await decrypt(stored, userId);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    // Key might have been stored with different user, clear it
    localStorage.removeItem(getStorageKey(provider));
    return null;
  }
}

/**
 * Remove an API key
 * @param provider - The AI provider
 */
export function removeApiKey(provider: AIProvider): void {
  localStorage.removeItem(getStorageKey(provider));
}

/**
 * Check if an API key exists for a provider
 * @param provider - The AI provider
 */
export function hasApiKey(provider: AIProvider): boolean {
  return localStorage.getItem(getStorageKey(provider)) !== null;
}

/**
 * Clear all stored API keys
 */
export function clearAllApiKeys(): void {
  const providers: AIProvider[] = ['gemini', 'openai', 'anthropic', 'grok'];
  providers.forEach((provider) => removeApiKey(provider));
}

/**
 * Test if an API key is valid by attempting to decrypt it
 * @param provider - The AI provider
 * @param userId - User ID for decryption
 */
export async function validateStoredKey(
  provider: AIProvider,
  userId: string
): Promise<boolean> {
  try {
    const key = await getApiKey(provider, userId);
    return key !== null && key.length > 0;
  } catch {
    return false;
  }
}
