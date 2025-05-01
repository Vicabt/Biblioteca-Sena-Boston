'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BookList } from '@/components/books/book-list'
import { BookForm } from '@/components/books/book-form'
import { BookSearch } from '@/components/books/book-search'
import { BookSkeleton } from '@/components/books/book-skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook } from '@/hooks/use-books'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function BooksPage() {
  const [selectedBook, setSelectedBook] = useState<Book | undefined>()
  const [bookToDelete, setBookToDelete] = useState<string | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  
  const { data: books = [], isLoading } = useBooks()
  const createBook = useCreateBook()
  const updateBook = useUpdateBook()
  const deleteBook = useDeleteBook()

  const handleSubmit = async (data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedBook) {
        await updateBook.mutateAsync({ id: selectedBook.id, ...data })
        toast.success('Libro actualizado correctamente')
      } else {
        await createBook.mutateAsync(data)
        toast.success('Libro creado correctamente')
      }
      setIsDialogOpen(false)
      setSelectedBook(undefined)
    } catch (error) {
      toast.error('Error al guardar el libro')
      console.error('Error saving book:', error)
    }
  }

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!bookToDelete) return
    
    try {
      await deleteBook.mutateAsync(bookToDelete)
      toast.success('Libro eliminado correctamente')
      setBookToDelete(undefined)
    } catch (error) {
      toast.error('Error al eliminar el libro')
      console.error('Error deleting book:', error)
    }
  }

  const handleLoan = (book: Book) => {
    // Redirigir a la página de préstamos con el libro seleccionado
    router.push(`/loans/new?bookId=${book.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Libros</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedBook(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Libro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBook ? 'Editar Libro' : 'Nuevo Libro'}
              </DialogTitle>
            </DialogHeader>
            <BookForm
              book={selectedBook}
              onSubmit={handleSubmit}
              isLoading={createBook.isPending || updateBook.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-2xl mx-auto">
        <BookSearch onSelect={handleEdit} />
      </div>

      {isLoading ? (
        <BookSkeleton />
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay libros registrados</p>
        </div>
      ) : (
        <BookList
          books={books}
          onEdit={handleEdit}
          onDelete={setBookToDelete}
          onLoan={handleLoan}
        />
      )}

      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El libro será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}