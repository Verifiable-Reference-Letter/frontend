import memoryCache, { CacheClass } from 'memory-cache';

class CacheService<K, V> {
  private memCache: CacheClass<K, V> = new memoryCache.Cache();
  private duration: number; // in milliseconds
  constructor(minutes: number) {
    this.duration = 1000 * minutes * 60;
  }
  put(key: K, value: V) {
    console.log("put", key, value);
    this.memCache.put(key, value, this.duration);
  }
  get(key: K) {
    console.log("get", key);
    return this.memCache.get(key);
  }
} export default CacheService;