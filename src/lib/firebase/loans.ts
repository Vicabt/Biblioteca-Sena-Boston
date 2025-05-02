import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './config'
import { addWorkingDays } from '@/lib/utils/dates'
import type { Loan } from '@/types/loan'
import { updateBook } from './books'

const COLLECTION_NAME = 'loans'
const PAGE_SIZE = 10

export async function getLoans(lastDoc?: QueryDocumentSnapshot) {
  try {
    const loansRef = collection(db, COLLECTION_NAME)
    let q = query(
      loansRef,
      where('status', '==', 'active'),
      orderBy('dueDate', 'asc'),
      limit(PAGE_SIZE)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const querySnapshot = await getDocs(q)
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
    
    const loans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Loan[]

    return {
      loans,
      lastDoc: lastVisible,
      hasMore: querySnapshot.docs.length === PAGE_SIZE
    }
  } catch (error) {
    console.error('Error getting loans:', error)
    throw new Error('Error al cargar los préstamos')
  }
}

export async function getLoansByUser(userId: string) {
  try {
    const loansRef = collection(db, COLLECTION_NAME)
    const q = query(
      loansRef,
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Loan[]
  } catch (error) {
    console.error('Error getting user loans:', error)
    throw error
  }
}

export async function getActiveLoanByBook(bookId: string) {
  try {
    const loansRef = collection(db, COLLECTION_NAME)
    const q = query(
      loansRef,
      where('bookId', '==', bookId),
      where('status', '==', 'active')
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Loan
  } catch (error) {
    console.error('Error getting active loan:', error)
    throw error
  }
}

export async function checkUserStatus(userId: string) {
  try {
    const userLoans = await getLoansByUser(userId)
    const hasOverdueLoans = userLoans.some(loan => loan.status === 'overdue')
    const activeLoansCount = userLoans.filter(loan => loan.status === 'active').length

    return {
      isInGoodStanding: !hasOverdueLoans,
      activeLoansCount,
      canBorrow: !hasOverdueLoans && activeLoansCount < 3
    }
  } catch (error) {
    console.error('Error checking user status:', error)
    throw error
  }
}

export async function createLoan(
  data: Omit<Loan, 'id' | 'status' | 'dueDate' | 'returnDate' | 'createdAt' | 'updatedAt'>
) {
  try {
    // Verificar disponibilidad del libro
    if (data.book!.stockAvailable <= 0) {
      throw new Error('El libro no está disponible para préstamo')
    }

    // Verificar estado del usuario
    const userStatus = await checkUserStatus(data.userId)
    
    if (!userStatus.isInGoodStanding) {
      throw new Error('El usuario tiene préstamos vencidos pendientes')
    }

    if (userStatus.activeLoansCount >= 3) {
      throw new Error('El usuario ha alcanzado el límite de préstamos activos')
    }

    const now = new Date()
    const daysToAdd = data.duration === '3days' ? 3 : 15
    const dueDate = addWorkingDays(now, daysToAdd)

    const now_ts = Timestamp.fromDate(now)
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      startDate: Timestamp.fromDate(data.startDate),
      dueDate: Timestamp.fromDate(dueDate),
      status: 'active',
      createdAt: now_ts,
      updatedAt: now_ts,
    })

    // Update book stock
    await updateBook(data.bookId, {
      stockAvailable: data.book!.stockAvailable - 1
    })

    return docRef.id
  } catch (error) {
    console.error('Error creating loan:', error)
    throw error
  }
}

export async function returnLoan(id: string, bookId: string, currentStock: number) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const now = new Date()
    
    await updateDoc(docRef, {
      returnDate: Timestamp.fromDate(now),
      status: 'returned',
      updatedAt: Timestamp.fromDate(now)
    })

    // Update book stock
    await updateBook(bookId, {
      stockAvailable: currentStock + 1
    })
  } catch (error) {
    console.error('Error returning loan:', error)
    throw error
  }
}

export async function getLoanById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Loan not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      startDate: docSnap.data().startDate?.toDate(),
      dueDate: docSnap.data().dueDate?.toDate(),
      returnDate: docSnap.data().returnDate?.toDate(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Loan
  } catch (error) {
    console.error('Error getting loan:', error)
    throw error
  }
}