// src/components/menu/CategoryFilter.tsx
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) {
  const formatCategoryName = (category: string) => 
    category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onCategorySelect(selectedCategory === category ? null : category)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            selectedCategory === category
              ? "bg-[#CF8989] text-white"
              : "bg-rose-100 text-[#CF8989] hover:bg-rose-200"
          }`}
        >
          {formatCategoryName(category)}
        </button>
      ))}
    </div>
  );
}