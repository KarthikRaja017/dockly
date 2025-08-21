
export interface Bookmark {
  hubs: never[];
  dateAdded: string | undefined;
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
  is_favorite?: boolean;
  favicon?: string;
  createdAt?: string;
  created_at?: string;
  user_id?: string;
  tagged_ids?: string[];
  hub?: string; // Add hub field
}
export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  favicon?: string;
  hub?: string; // Add hub field
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
  categories: string[];
}

