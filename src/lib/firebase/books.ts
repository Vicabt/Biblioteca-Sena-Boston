import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Book } from '@/types/book'

const COLLECTION_NAME = 'books'
const BOOKS_PER_PAGE = 12

export async function getBooks(page = 1, category?: string) {
  try {
    const booksRef = collection(db, COLLECTION_NAME)
    let q = query(booksRef, orderBy('title'))
    
    if (category) {
      q = query(q, where('category', '==', category))
    }
    
    if (page > 1) {
      const snapshot = await getDocs(query(booksRef, limit((page - 1) * BOOKS_PER_PAGE)))
      const lastVisible = snapshot.docs[snapshot.docs.length - 1]
      q = query(q, startAfter(lastVisible), limit(BOOKS_PER_PAGE))
    } else {
      q = query(q, limit(BOOKS_PER_PAGE))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Book[]
  } catch (error) {
    console.error('Error getting books:', error)
    throw error
  }
}

export async function getBookById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Book not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Book
  } catch (error) {
    console.error('Error getting book:', error)
    throw error
  }
}

export async function createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...bookData,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating book:', error)
    throw error
  }
}

export async function updateBook(id: string, bookData: Partial<Omit<Book, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...bookData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating book:', error)
    throw error
  }
}

export async function deleteBook(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting book:', error)
    throw error
  }
}

export async function searchBooks(searchTerm: string) {
  try {
    if (!searchTerm.trim()) {
      return []
    }

    const booksRef = collection(db, COLLECTION_NAME)
    const searchTermLower = searchTerm.toLowerCase()
    
    // Primero buscamos por título
    const titleQuery = query(
      booksRef,
      orderBy('title'),
      limit(10)
    )
    
    const querySnapshot = await getDocs(titleQuery)
    const results = querySnapshot.docs
      .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      } as Book))
      .filter(book => 
        book.title.toLowerCase().includes(searchTermLower) ||
        book.author.toLowerCase().includes(searchTermLower) ||
        book.internalCode.toLowerCase().includes(searchTermLower)
      )

    return results
  } catch (error) {
    console.error('Error searching books:', error)
    throw error
  }
}