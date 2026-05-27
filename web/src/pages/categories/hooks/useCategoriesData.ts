import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { isValidHexColor } from '../lib/color';
import type { CategoriesResponse, Category } from '../types';

const EMPTY_CATEGORIES: Category[] = [];
const COLOR_VALIDATION_MESSAGE = 'Color must be a valid hex value like #6b8db5.';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to load categories (${response.status})`);
  }

  return (await response.json()) as T;
}

async function sendCategoryRequest<T>(
  url: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
): Promise<T | null> {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error ?? `Failed to update categories (${response.status})`);
  }

  if (response.status === 204) return null;
  return (await response.json().catch(() => null)) as T | null;
}

function sortFavoriteCategories(categories: Category[]): Category[] {
  return categories
    .filter((category) => category.isFavorite)
    .sort((a, b) => {
      const aAt = a.favoritedAt ? new Date(a.favoritedAt).getTime() : 0;
      const bAt = b.favoritedAt ? new Date(b.favoritedAt).getTime() : 0;
      return aAt - bAt;
    });
}

export function useCategoriesData() {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    data: categoriesPayload,
    error: categoriesError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<CategoriesResponse>('/api/categories', fetchJson, {
    dedupingInterval: 10_000,
    shouldRetryOnError: false,
  });

  const categories = useMemo(() => categoriesPayload?.data ?? EMPTY_CATEGORIES, [categoriesPayload]);
  const favorites = useMemo(() => sortFavoriteCategories(categories), [categories]);
  const rest = useMemo(() => categories.filter((category) => !category.isFavorite), [categories]);
  const error =
    mutationError ??
    (categoriesError instanceof Error ? categoriesError.message : categoriesError ? 'Failed to load categories' : null);
  const loading = isLoading || (!categoriesPayload && isValidating);

  const refresh = useCallback(async () => {
    setMutationError(null);
    await mutate();
  }, [mutate]);

  const createCategory = useCallback(async (name: string, color: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;
    if (!isValidHexColor(color)) {
      setMutationError(COLOR_VALIDATION_MESSAGE);
      return false;
    }

    setCreating(true);
    setMutationError(null);

    try {
      await sendCategoryRequest<CategoriesResponse>('/api/categories', 'POST', { name: trimmedName, color });
      await mutate();
      return true;
    } catch (createError) {
      setMutationError(createError instanceof Error ? createError.message : 'Failed to create category');
      return false;
    } finally {
      setCreating(false);
    }
  }, [mutate]);

  const renameCategory = useCallback(async (id: number, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    setMutationError(null);

    try {
      await sendCategoryRequest<CategoriesResponse>(`/api/categories/${id}`, 'PATCH', { name: trimmedName });
      await mutate();
      return true;
    } catch (renameError) {
      setMutationError(renameError instanceof Error ? renameError.message : 'Failed to rename category');
      return false;
    }
  }, [mutate]);

  const deleteCategory = useCallback(async (category: Category) => {
    setDeleting(true);
    setMutationError(null);

    try {
      await sendCategoryRequest<null>(`/api/categories/${category.id}`, 'DELETE');
      await mutate();
      return true;
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : 'Failed to delete category');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [mutate]);

  const toggleFavorite = useCallback(async (category: Category) => {
    const nextFavorite = !category.isFavorite;
    const nextFavoritedAt = nextFavorite ? new Date().toISOString() : null;
    setMutationError(null);

    void mutate((current) => {
      if (!current) return current;
      return {
        ...current,
        data: current.data.map((candidate) =>
          candidate.id === category.id
            ? { ...candidate, isFavorite: nextFavorite, favoritedAt: nextFavoritedAt }
            : candidate,
        ),
      };
    }, { revalidate: false });

    try {
      await sendCategoryRequest<CategoriesResponse>(`/api/categories/${category.id}`, 'PATCH', {
        isFavorite: nextFavorite,
      });
    } catch (favoriteError) {
      void mutate((current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((candidate) =>
            candidate.id === category.id
              ? { ...candidate, isFavorite: category.isFavorite, favoritedAt: category.favoritedAt ?? null }
              : candidate,
          ),
        };
      }, { revalidate: false });
      setMutationError(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favorite');
    }
  }, [mutate]);

  const updateCategoryColor = useCallback(async (id: number, color: string) => {
    if (!isValidHexColor(color)) {
      setMutationError(COLOR_VALIDATION_MESSAGE);
      return false;
    }

    setMutationError(null);

    try {
      await sendCategoryRequest<CategoriesResponse>(`/api/categories/${id}`, 'PATCH', { color });
      await mutate();
      return true;
    } catch (colorError) {
      setMutationError(colorError instanceof Error ? colorError.message : 'Failed to update color');
      return false;
    }
  }, [mutate]);

  return {
    categories,
    favorites,
    rest,
    loading,
    error,
    creating,
    deleting,
    refresh,
    createCategory,
    renameCategory,
    deleteCategory,
    toggleFavorite,
    updateCategoryColor,
  };
}
