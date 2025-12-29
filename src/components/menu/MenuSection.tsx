// src/components/menu/MenuSection.tsx
import { useState, useEffect } from 'react';
import type { MenuResponse } from './types';
import { CategoryFilter } from './CategoryFilter';
import { MenuItemGrid } from './MenuItemGrid';
import { OrderSummary } from './OrderSummary';
import { LoadingSpinner } from '../reservation/LoadingSpinner';

interface MenuSectionProps {
  cart: Record<number, number>;
  onIncrementItem: (itemId: number) => void;
  onDecrementItem: (itemId: number) => void;
}

export function MenuSection({ cart, onIncrementItem, onDecrementItem }: MenuSectionProps) {
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoadingMenu(false);
      }
    };
    
    fetchMenu();
  }, []);

  if (loadingMenu) {
    return <LoadingSpinner text="Loading menu…" />;
  }

  if (!menuData) {
    return <p className="text-gray-500 text-sm">Unable to load menu.</p>;
  }

  return (
    <div className="space-y-6">
      <CategoryFilter
        categories={menuData.categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {selectedCategory && menuData.grouped[selectedCategory] && (
        <MenuItemGrid
          items={menuData.grouped[selectedCategory]}
          cart={cart}
          onIncrement={onIncrementItem}
          onDecrement={onDecrementItem}
        />
      )}

      <OrderSummary cart={cart} menuItems={menuData.items} />
    </div>
  );
}