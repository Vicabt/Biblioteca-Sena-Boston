import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from './config'

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    const firebaseError = error as FirebaseError
    switch (firebaseError.code) {
      case 'auth/invalid-credential':
        throw new Error('Credenciales inválidas')
      case 'auth/user-not-found':
        throw new Error('Usuario no encontrado')
      case 'auth/wrong-password':
        throw new Error('Contraseña incorrecta')
      default:
        throw new Error('Error al iniciar sesión')
    }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw new Error('Error al cerrar sesión')
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
} 