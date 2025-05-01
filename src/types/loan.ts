import { Book } from './book'
import { User } from './user'

export type LoanStatus = 'active' | 'returned' | 'overdue'
export type LoanDuration = '3days' | '15days'

export interface Loan {
  id: string
  userId: string
  bookId: string
  startDate: Date
  dueDate: Date
  returnDate?: Date
  status: LoanStatus
  duration: LoanDuration
  book?: Book
  user?: User
  createdAt: Date
  updatedAt: Date
}