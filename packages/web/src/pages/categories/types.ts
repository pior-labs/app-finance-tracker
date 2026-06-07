export interface Category {
  id: number;
  name: string;
  color: string;
  isFavorite?: boolean;
  favoritedAt?: string | null;
}

export interface CategoriesResponse {
  data: Category[];
}
