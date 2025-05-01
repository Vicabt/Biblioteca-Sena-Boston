'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Loan } from '@/types/loan'
import { formatDate } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/badge'

interface LoanListProps {
  loans: Loan[]
  onReturn?: (loan: Loan) => void
  isLoading?: boolean
}

export function LoanList({ loans, onReturn, isLoading }: LoanListProps) {
  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 dark:text-green-500'
      case 'overdue':
        return 'bg-red-500/20 text-red-700 dark:text-red-500'
      case 'returned':
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-500'
      default:
        return ''
    }
  }

  const getStatusText = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'overdue':
        return 'Vencido'
      case 'returned':
        return 'Devuelto'
      default:
        return status
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {loan.book?.title}
              </CardTitle>
              <Badge className={getStatusColor(loan.status)}>
                {getStatusText(loan.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Usuario: </span>
              <span>{loan.user?.name}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha inicio: </span>
              <span>{formatDate(loan.startDate)}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha devolución: </span>
              <span>{formatDate(loan.dueDate)}</span>
            </div>
            {loan.returnDate && (
              <div>
                <span className="text-sm text-muted-foreground">Devuelto el: </span>
                <span>{formatDate(loan.returnDate)}</span>
              </div>
            )}
          </CardContent>
          {loan.status === 'active' && onReturn && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onReturn(loan)}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Marcar como devuelto'}
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}