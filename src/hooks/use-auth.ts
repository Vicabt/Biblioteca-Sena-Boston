import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, onAuthStateChange } from '@/lib/firebase/auth'
import type { User } from 'firebase/auth'
import Cookies from 'js-cookie'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      setLoading(false)

      if (user) {
        // Obtener el token y guardarlo en una cookie
        const token = await user.getIdToken()
        Cookies.set('firebase-token', token, { 
          expires: 7, // 7 días
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      } else {
        // Eliminar el token cuando el usuario cierra sesión
        Cookies.remove('firebase-token')
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const user = await signIn(email, password)
      const token = await user.getIdToken()
      
      // Guardar el token en una cookie
      Cookies.set('firebase-token', token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      router.push('/')
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error al iniciar sesión')
    }
  }

  const logout = async () => {
    try {
      await signOut()
      Cookies.remove('firebase-token')
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error al cerrar sesión')
    }
  }

  return {
    user,
    loading,
    login,
    logout,
  }
} 