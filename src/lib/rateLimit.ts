type Key = string;

type Entry = { count: number; expiresAt: number };

const store: Map<Key, Entry> = new Map();

export function rateLimitHit(key: string, limit = 10, windowMs = 60_000): boolean {
	const now = Date.now();
	const existing = store.get(key);
	if (!existing || existing.expiresAt < now) {
		store.set(key, { count: 1, expiresAt: now + windowMs });
		return true;
	}
	if (existing.count >= limit) {
		return false;
	}
	existing.count += 1;
	store.set(key, existing);
	return true;
} 