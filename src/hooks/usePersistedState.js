import { useEffect, useState } from "react";

export default function usePersistedState(key, initialValue, storage = window.localStorage) {
  const [value, setValue] = useState(() => {
    try {
      const stored = storage.getItem(key);
      return stored == null ? initialValue : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private mode; keep in-memory state.
    }
  }, [key, storage, value]);

  return [value, setValue];
}
