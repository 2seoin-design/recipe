import { useEffect, useState } from 'react';

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// cart item: { id, qty }
export function useCart() {
  return useLocalState('cart', []);
}

// fridge item: { id, qty, addedAt, cartCount }
export function useFridge() {
  return useLocalState('fridge', []);
}

export function useFavorites() {
  return useLocalState('favorites', []);
}

export function useAuth() {
  return useLocalState('isLoggedIn', false);
}

export function dDay(addedAt, shelfLifeDays) {
  const expiresAt = addedAt + shelfLifeDays * 86400000;
  return Math.ceil((expiresAt - Date.now()) / 86400000);
}
