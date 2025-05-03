import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Author } from '@/types/author'

const COLLECTION_NAME = 'authors'

export async function getAuthors() {
  try {
    const authorsRef = collection(db, COLLECTION_NAME)
    const q = query(authorsRef, orderBy('name'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Author[]
  } catch (error) {
    console.error('Error getting authors:', error)
    throw error
  }
}

export async function getAuthorById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Author not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Author
  } catch (error) {
    console.error('Error getting author:', error)
    throw error
  }
}

export async function createAuthor(authorData: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...authorData,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating author:', error)
    throw error
  }
}

export async function updateAuthor(id: string, authorData: Partial<Omit<Author, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...authorData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating author:', error)
    throw error
  }
}

export async function deleteAuthor(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting author:', error)
    throw error
  }
}