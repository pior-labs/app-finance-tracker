import type { Category } from '@finlens/shared';

const placeholderCategories: Category[] = [];

export function CategoriesPage() {
  return (
    <section>
      <h2>Categories</h2>
      <p>Seeded categories and management tools will appear here.</p>
      <p>Placeholder count: {placeholderCategories.length}</p>
    </section>
  );
}
