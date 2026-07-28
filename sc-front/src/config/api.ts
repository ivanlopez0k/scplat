/**
 * API base URL configuration.
 *
 * - In production, defaults to the deployed backend on Vercel.
 * - Override by setting VITE_API_URL env var at build time.
 * - In development, set VITE_API_URL=http://localhost:3000 in .env.development.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://scplat-back.vercel.app';
