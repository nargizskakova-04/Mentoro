/**
 * Use these when calling the FastAPI backend.
 * - Server-side (API routes): use getBackendUrl() — e.g. when proxying to FastAPI inside Docker (backend:8000).
 * - Client-side (browser): use getPublicApiUrl() — e.g. when calling the backend from the browser (localhost:8000).
 */

export function getBackendUrl(): string {
  return process.env.BACKEND_URL ?? 'http://backend:8000';
}

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
}
