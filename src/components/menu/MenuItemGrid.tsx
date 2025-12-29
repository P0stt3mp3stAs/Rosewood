// src/components/menu/MenuItemGrid.tsx
import type { MenuItem } from './types';
import { MenuItemCard } from './MenuItemCard';

interface MenuItemGridProps {
  items: MenuItem[];
  cart: Record<number, number>;
  onIncrement: (itemId: number) => void;
  onDecrement: (itemId: number) => void;
}

export function MenuItemGrid({ items, cart, onIncrement, onDecrement }: MenuItemGridProps) {
  return (
    <div className="bg-[#CF8989]/20 rounded-3xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          quantity={cart[item.id] || 0}
          onIncrement={() => onIncrement(item.id)}
          onDecrement={() => onDecrement(item.id)}
        />
      ))}
    </div>
  );
}