'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Book } from '@/types/book'
import { LoanDuration } from '@/types/loan'
import { checkUserStatus } from '@/lib/firebase/loans'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Search } from 'lucide-react'
import { getUserByDocument } from '@/lib/firebase/users'
import type { User } from '@/types/user'

interface LoanFormProps {
  book: Book
  onSubmit: (data: {
    userId: string
    bookId: string
    startDate: Date
    duration: LoanDuration
    book: Book
  }) => Promise<void>
  isLoading?: boolean
}

export function LoanForm({ book, onSubmit, isLoading }: LoanFormProps) {
  const [documentId, setDocumentId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userStatus, setUserStatus] = useState<{
    isInGoodStanding: boolean
    activeLoansCount: number
    canBorrow: boolean
  } | null>(null)

  const form = useForm({
    defaultValues: {
      userId: '',
      duration: '3days' as LoanDuration
    }
  })

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
        setSelectedUser(null)
        setUserStatus(null)
        form.setValue('userId', '')
        return
      }

      setSelectedUser(user)
      form.setValue('userId', user.id)

      // Verificar estado del usuario
      try {
        const status = await checkUserStatus(user.id)
        setUserStatus(status)

        if (!status.canBorrow) {
          if (!status.isInGoodStanding) {
            toast.error('El usuario tiene préstamos vencidos pendientes')
          } else if (status.activeLoansCount >= 3) {
            toast.error('El usuario ha alcanzado el límite de préstamos activos')
          }
        }
      } catch (statusError) {
        console.error('Error checking user status:', statusError)
        toast.error('Error al verificar el estado del usuario')
        setUserStatus(null)
      }
    } catch (error) {
      toast.error('Error al buscar el usuario: ' + (error instanceof Error ? error.message : 'Error desconocido'))
      console.error('Error searching user:', error)
      setSelectedUser(null)
      setUserStatus(null)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        if (!userStatus?.canBorrow) return
        await onSubmit({
          ...data,
          bookId: book.id,
          startDate: new Date(),
          book: book
        })
      })} className="space-y-4">
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Número de Documento</FormLabel>
            <div className="flex gap-2">
              <Input
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ingrese el número de documento"
              />
              <Button
                type="button"
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
          </FormItem>

          {selectedUser && (
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Información del Usuario</h3>
              <dl className="space-y-1">
                <div>
                  <dt className="text-sm text-muted-foreground">Nombre</dt>
                  <dd className="text-foreground">{selectedUser.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="text-foreground">{selectedUser.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Teléfono</dt>
                  <dd className="text-foreground">{selectedUser.phone}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {userStatus && (
          <Alert variant={userStatus.canBorrow ? "default" : "destructive"}>
            {userStatus.canBorrow ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {userStatus.canBorrow
                ? "Usuario habilitado para préstamos"
                : "Usuario no habilitado para préstamos"
              }
            </AlertTitle>
            <AlertDescription>
              {userStatus.isInGoodStanding
                ? `Préstamos activos: ${userStatus.activeLoansCount}/3`
                : "El usuario tiene préstamos vencidos pendientes"}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración del préstamo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la duración" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3days">3 días hábiles</SelectItem>
                  <SelectItem value="15days">15 días hábiles</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 space-x-2 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !form.getValues('userId') || !userStatus?.canBorrow}
          >
            {isLoading ? 'Procesando...' : 'Crear préstamo'}
          </Button>
        </div>
      </form>
    </Form>
  )
}