'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useBook } from '@/hooks/use-books'
import { useCreateLoan } from '@/hooks/use-loans'
import { LoanForm } from '@/components/loans/loan-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Book } from '@/types/book'
import type { LoanDuration } from '@/types/loan'

interface LoanFormData {
  userId: string
  duration: LoanDuration
}

export default function NewLoanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookId = searchParams.get('bookId')
  const [book, setBook] = useState<Book | null>(null)
  const { data: bookData, isLoading, error } = useBook(bookId || '')
  const createLoan = useCreateLoan()

  useEffect(() => {
    if (bookData) {
      setBook(bookData)
    }
  }, [bookData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error || !bookId || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">Error al cargar el libro</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    )
  }

  const handleSubmit = async (data: LoanFormData) => {
    try {
      await createLoan.mutateAsync({
        ...data,
        bookId: book!.id,
        book: book!,
        startDate: new Date(),
      })
      router.push('/loans')
      toast.success('Préstamo creado correctamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el préstamo')
      console.error('Error creating loan:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Préstamo</h1>
      </div>

      <div className="flex items-start gap-6">
        <div className="flex-1 space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h2 className="font-semibold mb-2">Detalles del Libro</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Título</dt>
                <dd className="text-foreground">{book.title}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Autor</dt>
                <dd className="text-foreground">{book.author}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Código</dt>
                <dd className="text-foreground">{book.internalCode}</dd>
              </div>
            </dl>
          </div>

          <LoanForm 
            book={book} 
            onSubmit={handleSubmit} 
            isLoading={createLoan.isPending} 
          />
        </div>
      </div>
    </div>
  )
} 