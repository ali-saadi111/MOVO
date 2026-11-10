import { sync } from '@/data';
import { useCart } from '@/stores/cart';

export const DELIVERY_CENTS = 500;

export function useCartTotals() {
  const lines = useCart((s) => s.lines);
  const items = lines.map((l) => ({ ...l, p: sync.product(l.productId)! })).filter((x) => x.p);
  const subtotal = items.reduce((n, x) => n + x.p.priceCents * x.qty, 0);
  return { items, subtotal, delivery: items.length ? DELIVERY_CENTS : 0, total: subtotal + (items.length ? DELIVERY_CENTS : 0) };
}

