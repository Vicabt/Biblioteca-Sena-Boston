import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { getUserByDocument } from '@/lib/firebase/users'
import { toast } from 'sonner'
import type { User } from '@/types/user'
import type { Loan } from '@/types/loan'

interface UserSearchProps {
  onUserFound?: (hasActiveLoans: boolean) => void
}

export function UserSearch({ onUserFound }: UserSearchProps) {
  const [documentId, setDocumentId] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!documentId.trim()) {
      toast.error('Ingrese un número de documento')
      return
    }

    setIsSearching(true)
    try {
      const user = await getUserByDocument(documentId)
      if (!user) {
        toast.error('Usuario no encontrado')
        return
      }

      // Verificar préstamos activos
      const activeLoans = (user as User & { loans?: Loan[] }).loans?.filter((loan: Loan) => loan.status === 'active') || []
      const hasActiveLoans = activeLoans.length > 0

      if (hasActiveLoans) {
        toast.error(`El usuario tiene ${activeLoans.length} préstamo(s) activo(s)`)
      } else {
        toast.success('El usuario está a paz y salvo')
      }

      onUserFound?.(hasActiveLoans)
    } catch (error) {
      toast.error('Error al buscar el usuario')
      console.error('Error searching user:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Buscar por número de documento..."
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
        className="max-w-sm"
      />
      <Button 
        onClick={handleSearch}
        disabled={isSearching}
        variant="secondary"
      >
        {isSearching ? (
          'Buscando...'
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </>
        )}
      </Button>
    </div>
  )
} 