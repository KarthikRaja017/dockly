export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
  favicon: string;
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface StatsResponse {
  total_bookmarks: number;
  favorite_bookmarks: number;
  categories_count: number;
}

export interface CategoriesResponse {
  categories: string[];
}
