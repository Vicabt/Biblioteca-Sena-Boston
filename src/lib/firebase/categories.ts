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
import type { Category } from '@/types/category'

const COLLECTION_NAME = 'categories'

export async function getCategories() {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME)
    const q = query(categoriesRef, orderBy('name'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Category[]
  } catch (error) {
    console.error('Error getting categories:', error)
    throw error
  }
}

export async function getCategoryById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Category not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Category
  } catch (error) {
    console.error('Error getting category:', error)
    throw error
  }
}

export async function createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

export async function updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}