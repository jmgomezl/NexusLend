const store = new Map();
try {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
      setItem: (key, value) => {
        store.set(String(key), String(value));
      },
      removeItem: (key) => {
        store.delete(String(key));
      },
      clear: () => {
        store.clear();
      }
    },
    configurable: true,
    enumerable: false,
    writable: false
  });
} catch (error) {
  // ignore if Node already provides non-configurable localStorage
}
