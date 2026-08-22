export function safeImageUrl(
  value: string | null | undefined,
  fallback: string = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
): string {
  if (!value) return fallback;

  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Ignore malformed urls and fallback
  }

  return fallback;
}
