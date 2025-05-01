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
  Timestamp,
  startAt,
  endAt,
} from 'firebase/firestore'
import { db } from './config'
import type { User } from '@/types/user'

const COLLECTION_NAME = 'users'

export async function getUsers() {
  try {
    const usersRef = collection(db, COLLECTION_NAME)
    const q = query(usersRef, orderBy('name'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as User[]
  } catch (error) {
    console.error('Error getting users:', error)
    throw error
  }
}

export async function getUserById(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('User not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as User
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

export async function getUserByDocument(documentId: string) {
  try {
    const usersRef = collection(db, COLLECTION_NAME)
    const q = query(usersRef, where('documentId', '==', documentId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as User
  } catch (error) {
    console.error('Error getting user by document:', error)
    throw error
  }
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Verificar si ya existe un usuario con el mismo documento
    const existingUser = await getUserByDocument(userData.documentId)
    if (existingUser) {
      throw new Error('Ya existe un usuario con este número de documento')
    }

    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...userData,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function deleteUser(id: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function searchUsers(searchTerm: string) {
  try {
    const usersRef = collection(db, COLLECTION_NAME)
    const q = query(
      usersRef,
      where('status', '==', 'active'),
      orderBy('name'),
      startAt(searchTerm),
      endAt(searchTerm + '\uf8ff')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as User[]
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

export async function getUserWithLoans(documentId: string) {
  try {
    const user = await getUserByDocument(documentId)
    if (!user) return null

    // Obtener préstamos del usuario
    const loansRef = collection(db, 'loans')
    const q = query(loansRef, where('userId', '==', user.id))
    const querySnapshot = await getDocs(q)
    
    const loans = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))

    return {
      ...user,
      loans,
    }
  } catch (error) {
    console.error('Error getting user with loans:', error)
    throw error
  }
}