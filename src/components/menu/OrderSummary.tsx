// src/components/menu/OrderSummary.tsx
import type { MenuItem } from './types';

interface OrderSummaryProps {
  cart: Record<number, number>;
  menuItems: MenuItem[];
}

export function OrderSummary({ cart, menuItems }: OrderSummaryProps) {
  const getTotalItems = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  
  const calculateTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === Number(itemId));
      return sum + (item?.price || 0) * quantity;
    }, 0);
  };

  const totalItems = getTotalItems();
  
  if (totalItems === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-rose-200">
      <h3 className="font-black mb-3">Your Order ({totalItems})</h3>

      {Object.entries(cart).map(([id, qty]) => {
        const item = menuItems.find(i => i.id === Number(id));
        return (
          item && (
            <div key={id} className="flex justify-between text-sm">
              <span>{qty}× {item.name}</span>
              <span className="font-semibold text-[#CF8989]">
                ${(item.price * qty).toFixed(2)}
              </span>
            </div>
          )
        );
      })}

      <div className="pt-3 mt-3 border-t flex justify-between font-black">
        <span>Total</span>
        <span className="text-[#CF8989]">${calculateTotal().toFixed(2)}</span>
      </div>
    </div>
  );
}