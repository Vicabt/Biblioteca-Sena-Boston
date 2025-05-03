import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor } from '@/lib/firebase/authors'
import type { Author } from '@/types/author'

export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: getAuthors,
  })
}

export function useAuthorById(id: string) {
  return useQuery({
    queryKey: ['authors', id],
    queryFn: () => getAuthorById(id),
    enabled: !!id,
  })
}

export function useCreateAuthor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) => createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Omit<Author, 'id' | 'createdAt'>>) => 
      updateAuthor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['authors', variables.id] })
    },
  })
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    },
  })
}