"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import {
  addItem,
  clearItems,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setItemQty,
  subscribe,
  type CartItem,
} from "./cartStore";

export type { CartItem };

interface CartValue {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: typeof addItem;
  setQty: typeof setItemQty;
  remove: typeof removeItem;
  clear: typeof clearItems;
}

/**
 * The cart state lives in `cartStore` (localStorage-backed), so this provider
 * exists only to keep the existing component tree shape; `useCart` reads the
 * store directly and works with or without it.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart(): CartValue {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(
    () => ({
      items: snapshot.items,
      ready: snapshot.ready,
      count: snapshot.items.reduce((sum, i) => sum + i.qty, 0),
      total: snapshot.items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.qty, 0),
      add: addItem,
      setQty: setItemQty,
      remove: removeItem,
      clear: clearItems,
    }),
    [snapshot],
  );
}
