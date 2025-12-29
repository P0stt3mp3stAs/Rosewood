// src/components/menu/types.ts
export interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
}

export interface MenuResponse {
  success: boolean;
  items: MenuItem[];
  grouped: Record<string, MenuItem[]>;
  categories: string[];
}

