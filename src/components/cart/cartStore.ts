export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number | null;
  currency: string;
  image: string;
  qty: number;
  /** Set when the customer picked a size; absent for products without variants. */
  variantId?: string;
  /** Human-readable combination, e.g. `6" · 7.5 HP · Cast Iron`. */
  variantLabel?: string;
}

/**
 * Cart lines are keyed by product *and* variant — a 6" motor and an 8" motor are two
 * different order lines at two different prices, not one line with quantity 2.
 */
export function lineKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return item.variantId ? `${item.productId}::${item.variantId}` : item.productId;
}

export interface CartSnapshot {
  items: CartItem[];
  /** False until localStorage has been read, so the UI can avoid a hydration flash. */
  ready: boolean;
}

const STORAGE_KEY = "elwaha_cart_v1";

/**
 * The cart lives in localStorage, which makes it an external store rather than
 * React state. Modelling it with useSyncExternalStore keeps the server and
 * client renders in agreement during hydration and syncs across browser tabs.
 */
const SERVER_SNAPSHOT: CartSnapshot = { items: [], ready: false };

let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    // Corrupt JSON or storage blocked (private mode) — start empty.
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota or private-mode failure is non-fatal; the cart still works in memory.
  }
}

function commit(items: CartItem[], persist = true) {
  snapshot = { items, ready: true };
  if (persist) write(items);
  emit();
}

/** Called from subscribe (i.e. after mount), never during render. */
function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  commit(read(), false);
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();

  // Another tab changed the cart.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) commit(read(), false);
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartSnapshot {
  return snapshot;
}

export function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

export function addItem(item: Omit<CartItem, "qty">, qty = 1) {
  const key = lineKey(item);
  const existing = snapshot.items.find((i) => lineKey(i) === key);
  commit(
    existing
      ? snapshot.items.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i))
      : [...snapshot.items, { ...item, qty }],
  );
}

export function setItemQty(key: string, qty: number) {
  commit(
    qty <= 0
      ? snapshot.items.filter((i) => lineKey(i) !== key)
      : snapshot.items.map((i) => (lineKey(i) === key ? { ...i, qty } : i)),
  );
}

export function removeItem(key: string) {
  commit(snapshot.items.filter((i) => lineKey(i) !== key));
}

export function clearItems() {
  commit([]);
}
