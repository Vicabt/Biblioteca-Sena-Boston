'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Libros', href: '/books' },
  { name: 'Préstamos', href: '/loans' },
  { name: 'Usuarios', href: '/users' },
  { name: 'Alertas', href: '/calendar' },
]

export function Navigation() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada correctamente')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <div className="flex items-center justify-between">
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}