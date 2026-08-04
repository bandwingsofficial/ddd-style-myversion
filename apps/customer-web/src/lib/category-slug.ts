import { Category } from "@/features/categories/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Convert a category name to a URL-friendly slug (e.g. "Sugarcane Juice" → "sugarcane-juice"). */
export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a deep-linkable menu URL for a category. */
export function getMenuCategoryUrl(category: Pick<Category, "id" | "name">): string {
  return `/menu?category=${encodeURIComponent(categoryToSlug(category.name))}`;
}

/** Resolve a `?category=` param (UUID or slug) to a category from the list. */
export function resolveCategoryFromParam(
  param: string | null | undefined,
  categories: Category[],
): Category | null {
  if (!param || categories.length === 0) return null;

  const decoded = decodeURIComponent(param).trim();
  if (!decoded) return null;

  if (UUID_RE.test(decoded)) {
    return categories.find((c) => c.id === decoded) ?? null;
  }

  const normalized = decoded.toLowerCase();
  return (
    categories.find((c) => categoryToSlug(c.name) === normalized) ?? null
  );
}
