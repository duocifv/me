export function cacheWithTTL<T>(fn: () => Promise<T>, ttl: number): () => Promise<T> {
  let cache: T | null = null;
  let promiseCache: Promise<T> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function(): Promise<T> {
    if (cache !== null) return Promise.resolve(cache);
    if (promiseCache !== null) return promiseCache;
    
    promiseCache = fn().then(result => {
      cache = result;
      promiseCache = null;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        cache = null;
      }, ttl);
      return result;
    }).catch(err => {
      promiseCache = null; 
      throw err;
    });
    
    return promiseCache;
  };
}