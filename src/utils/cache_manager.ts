import NodeCache from "node-cache";

export class CacheManager {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 60 * 60 * 10) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds });
  }

  private generateKey(prefix: string, identifier: string): string {
    return `${prefix}:${identifier}`;
  }

  set(prefix: string, identifier: string, data: any): void {
    const key = this.generateKey(prefix, identifier);
    this.cache.set(key, data);
  }

  get<T>(prefix: string, identifier: string): T | undefined {
    const key = this.generateKey(prefix, identifier);
    return this.cache.get<T>(key);
  }

  del(prefix: string, identifier: string): void {
    const key = this.generateKey(prefix, identifier);
    this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
  }
}
