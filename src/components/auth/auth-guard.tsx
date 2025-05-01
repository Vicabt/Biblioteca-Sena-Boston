'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const publicPaths = ['/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user && !publicPaths.includes(pathname)) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`)
      } else if (user && publicPaths.includes(pathname)) {
        router.push('/')
      }
    }
  }, [user, loading, pathname, router])

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return null
  }

  // En rutas públicas o si el usuario está autenticado, mostrar el contenido
  if (publicPaths.includes(pathname) || user) {
    return <>{children}</>
  }

  // No mostrar nada mientras se redirige
  return null
} 