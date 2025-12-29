// src/components/menu/MenuItemCard.tsx
import type { MenuItem } from './types';

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function MenuItemCard({ item, quantity, onIncrement, onDecrement }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-rose-200 flex flex-col justify-between">
      <div>
        <h4 className="font-semibold text-sm">{item.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
        <p className="text-[#CF8989] font-bold text-sm mt-1">
          ${item.price.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={quantity === 0}
          className="w-7 h-7 rounded-full bg-rose-100 text-[#CF8989] font-bold text-sm disabled:opacity-40"
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-sm">{quantity}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="w-7 h-7 rounded-full bg-[#CF8989] text-white font-bold text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}