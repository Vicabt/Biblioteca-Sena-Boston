import { toast } from 'sonner'
import { formatDate } from './dates'
import type { Loan } from '@/types/loan'

export function checkOverdueLoans(loans: Loan[]) {
  const now = new Date()
  const overdueLoans = loans.filter(loan => {
    if (loan.status !== 'active') return false
    return loan.dueDate < now
  })

  if (overdueLoans.length > 0) {
    overdueLoans.forEach(loan => {
      toast.error(
        `El préstamo del libro "${loan.book?.title}" está vencido desde ${formatDate(loan.dueDate)}`,
        {
          duration: 5000,
          position: 'top-right'
        }
      )
    })
  }

  return overdueLoans
}

export function notifyUpcomingDueDate(loan: Loan) {
  const now = new Date()
  const daysUntilDue = Math.ceil((loan.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilDue <= 2 && daysUntilDue > 0) {
    toast.warning(
      `El préstamo del libro "${loan.book?.title}" vence en ${daysUntilDue} día${daysUntilDue === 1 ? '' : 's'}`,
      {
        duration: 5000,
        position: 'top-right'
      }
    )
  }
} 