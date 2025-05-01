export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  internalCode: string;
  coverUrl?: string;
  stockAvailable: number;
  createdAt: Date;
  updatedAt: Date;
}