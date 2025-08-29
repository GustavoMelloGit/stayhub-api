export interface Cache {
  /**
   * @description Retrieves a value from the cache by its key.
   * @param key - Item key name
   * @returns The cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;
  /**
   * @description Sets a value in the cache with an optional time to live (TTL).
   * @param key - Item key name
   * @param value - Item value
   * @param ttl - Time to live in seconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  /**
   * @description Deletes a value from the cache by its key.
   * @param key - Item key name
   */
  delete(key: string): Promise<void>;
}
