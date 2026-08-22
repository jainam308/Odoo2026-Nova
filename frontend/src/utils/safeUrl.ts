export function safeImageUrl(value: string | null | undefined, fallback: string): string {
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
