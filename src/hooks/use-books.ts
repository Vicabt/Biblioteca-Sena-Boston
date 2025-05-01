import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBooks, createBook, updateBook, deleteBook, getBookById, searchBooks } from '@/lib/firebase/books'
import type { Book } from '@/types/book'

export function useBooks(page = 1, category?: string) {
  return useQuery({
    queryKey: ['books', page, category],
    queryFn: () => getBooks(page, category),
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  })
}

export function useSearchBooks(searchTerm: string) {
  return useQuery({
    queryKey: ['books', 'search', searchTerm],
    queryFn: () => searchBooks(searchTerm),
    enabled: searchTerm.length > 0
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => 
      createBook(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Book, 'id' | 'createdAt'>>) =>
      updateBook(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}