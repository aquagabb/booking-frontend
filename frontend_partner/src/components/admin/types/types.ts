export interface Photo {
  id: number;
  url: string;
  isVisible: boolean;
  rating: number;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  rating: number;
  photos: Photo[];
}