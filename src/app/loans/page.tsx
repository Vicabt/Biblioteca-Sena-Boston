'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLoans, useReturnLoan } from '@/hooks/use-loans'
import { LoanList } from '@/components/loans/loan-list'
import { LoanSkeleton } from '@/components/loans/loan-skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { checkOverdueLoans, notifyUpcomingDueDate } from '@/lib/utils/notifications'
import type { Loan } from '@/types/loan'

type FilterStatus = 'all' | 'active' | 'overdue' | 'returned'

function LoansContent() {
  const [filter, setFilter] = useState<FilterStatus>('all')
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useLoans()
  const returnLoan = useReturnLoan()
  const router = useRouter()
  const { user } = useAuth()

  const loans = useMemo(() => 
    data?.pages.flatMap(page => (page as { loans: Loan[] }).loans) ?? [],
    [data]
  )

  useEffect(() => {
    if (user) {
      router.push('/loans')
    }
  }, [user, router])

  useEffect(() => {
    if (loans.length > 0) {
      checkOverdueLoans(loans)
      // Notificar préstamos próximos a vencer
      loans
        .filter(loan => loan.status === 'active')
        .forEach(notifyUpcomingDueDate)
    }
  }, [loans])

  const handleReturn = async (loan: Loan) => {
    try {
      if (!loan.book) {
        throw new Error('No se encontró información del libro')
      }
      
      await returnLoan.mutateAsync({
        id: loan.id,
        bookId: loan.bookId,
        currentStock: loan.book.stockAvailable
      })
      toast.success('Préstamo marcado como devuelto')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al devolver el préstamo')
      console.error('Error returning loan:', error)
    }
  }

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true
    if (filter === 'active') return loan.status === 'active'
    if (filter === 'overdue') return loan.status === 'overdue'
    if (filter === 'returned') return loan.status === 'returned'
    return true
  })

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">Error al cargar los préstamos</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Préstamos</h1>
        <Button onClick={() => router.push('/loans/new')}>
          Nuevo Préstamo
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Activos
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          onClick={() => setFilter('overdue')}
        >
          Vencidos
        </Button>
        <Button
          variant={filter === 'returned' ? 'default' : 'outline'}
          onClick={() => setFilter('returned')}
        >
          Devueltos
        </Button>
      </div>

      {isLoading ? (
        <LoanSkeleton />
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay préstamos registrados</p>
        </div>
      ) : (
        <>
          <LoanList
            loans={filteredLoans}
            onReturn={handleReturn}
          />
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function LoansPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <LoansContent />
    </Suspense>
  )
}