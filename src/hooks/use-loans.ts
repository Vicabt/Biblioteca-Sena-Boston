import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  getLoans,
  getLoanById,
  getLoansByUser,
  createLoan,
  returnLoan,
} from '@/lib/firebase/loans'
import type { Loan } from '@/types/loan'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

export function useLoans() {
  return useInfiniteQuery({
    queryKey: ['loans'],
    queryFn: ({ pageParam }: { pageParam: QueryDocumentSnapshot | undefined }) => getLoans(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
  })
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () => getLoanById(id),
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useUserLoans(userId: string) {
  return useQuery({
    queryKey: ['loans', 'user', userId],
    queryFn: () => getLoansByUser(userId),
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Loan, 'id' | 'status' | 'dueDate' | 'returnDate' | 'createdAt' | 'updatedAt'>) =>
      createLoan(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['loans', 'user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['books', variables.bookId] })
    },
    onError: (error: Error) => {
      throw new Error(error.message)
    }
  })
}

export function useReturnLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, bookId, currentStock }: { id: string, bookId: string, currentStock: number }) =>
      returnLoan(id, bookId, currentStock),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      queryClient.invalidateQueries({ queryKey: ['books', variables.bookId] })
    },
    onError: (error: Error) => {
      throw new Error(error.message)
    }
  })
}