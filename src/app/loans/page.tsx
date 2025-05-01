'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useLoans, useReturnLoan } from '@/hooks/use-loans'
import { LoanList } from '@/components/loans/loan-list'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { checkOverdueLoans, notifyUpcomingDueDate } from '@/lib/utils/notifications'
import type { Loan } from '@/types/loan'

type FilterStatus = 'all' | 'active' | 'overdue' | 'returned'

export default function LoansPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const { 
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useLoans()
  const returnLoan = useReturnLoan()

  const loans = data?.pages.flatMap(page => (page as { loans: Loan[] }).loans) ?? []
  const filteredLoans = loans.filter(loan => {
    if (filterStatus === 'all') return true
    return loan.status === filterStatus
  })

  useEffect(() => {
    if (loans.length > 0) {
      // Verificar préstamos vencidos
      checkOverdueLoans(loans)
      
      // Notificar préstamos próximos a vencer
      loans
        .filter(loan => loan.status === 'active')
        .forEach(notifyUpcomingDueDate)
    }
  }, [loans])

  const handleReturn = async (loan: Loan) => {
    try {
      await returnLoan.mutateAsync({
        id: loan.id,
        bookId: loan.bookId,
        currentStock: loan.book!.stockAvailable
      })
      toast.success('Préstamo marcado como devuelto')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al devolver el préstamo')
      console.error('Error returning loan:', error)
    }
  }

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
        <Select
          value={filterStatus}
          onValueChange={(value: string) => setFilterStatus(value as FilterStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="overdue">Vencidos</SelectItem>
            <SelectItem value="returned">Devueltos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[200px] animate-pulse" />
          ))}
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay préstamos que mostrar</p>
        </div>
      ) : (
        <>
        <LoanList
          loans={filteredLoans}
          onReturn={handleReturn}
          isLoading={returnLoan.isPending}
        />
          
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
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