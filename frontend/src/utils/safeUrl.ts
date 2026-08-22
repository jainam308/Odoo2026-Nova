export function safeImageUrl(
  value: string | null | undefined,
  fallback: string = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
): string {
  if (!value || typeof value !== 'string') return fallback;

  const trimmed = value.trim();
  // Prevent any local file system access or security error
  if (trimmed.toLowerCase().startsWith('file:') || (trimmed.startsWith('/') && !trimmed.startsWith('//'))) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'blob:') {
      return parsed.href;
    }
  } catch {
    // Ignore malformed urls and fallback
  }

  return fallback;
}
