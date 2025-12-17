const cache = new Map<string, { value: any; exp: number }>()

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const c = cache.get(key)
  if (c && c.exp > Date.now()) {
    return c.value
  }

  const value = await fn()
  cache.set(key, { value, exp: Date.now() + ttl * 1000 })
  return value
}

// 캐시 초기화 함수 (관리자용)
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear()
    return
  }

  // Array.from을 사용하여 downlevelIteration 오류 회피
  const keys = Array.from(cache.keys())
  for (const key of keys) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

