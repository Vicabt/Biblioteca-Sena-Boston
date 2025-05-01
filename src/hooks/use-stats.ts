import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface DashboardStats {
  totalBooks: number
  loanedBooks: number
  overdueBooks: number
  registeredUsers: number
}

async function getStats(): Promise<DashboardStats> {
  try {
    // Obtener total de libros
    const booksRef = collection(db, 'books')
    const booksSnapshot = await getDocs(booksRef)
    const totalBooks = booksSnapshot.size

    // Obtener préstamos activos y vencidos
    const loansRef = collection(db, 'loans')
    const activeLoansQuery = query(loansRef, where('status', '==', 'active'))
    const activeLoansSnapshot = await getDocs(activeLoansQuery)
    const loanedBooks = activeLoansSnapshot.size

    // Obtener préstamos vencidos
    const now = new Date()
    const overdueLoans = activeLoansSnapshot.docs.filter(doc => {
      const dueDate = doc.data().dueDate?.toDate()
      return dueDate && dueDate < now
    })
    const overdueBooks = overdueLoans.length

    // Obtener total de usuarios
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    const registeredUsers = usersSnapshot.size

    return {
      totalBooks,
      loanedBooks,
      overdueBooks,
      registeredUsers
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    throw new Error('Error al obtener las estadísticas')
  }
}

export function useStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getStats,
    refetchInterval: 1000 * 60 * 5, // Actualizar cada 5 minutos
  })
} 