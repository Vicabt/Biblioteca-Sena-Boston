'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { AuthorForm } from '@/components/authors/author-form'
import { useAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor } from '@/hooks/use-authors'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Author } from '@/types/author'

export default function AuthorsPage() {
  const [selectedAuthor, setSelectedAuthor] = useState<Author | undefined>()
  const [authorToDelete, setAuthorToDelete] = useState<string | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const { data: authors = [], isLoading } = useAuthors()
  const createAuthor = useCreateAuthor()
  const updateAuthor = useUpdateAuthor()
  const deleteAuthor = useDeleteAuthor()

  const handleSubmit = async (data: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedAuthor) {
        await updateAuthor.mutateAsync({ id: selectedAuthor.id, ...data })
        toast.success('Autor actualizado correctamente')
      } else {
        await createAuthor.mutateAsync(data)
        toast.success('Autor creado correctamente')
      }
      setIsDialogOpen(false)
      setSelectedAuthor(undefined)
    } catch (error) {
      toast.error('Error al guardar el autor')
      console.error('Error saving author:', error)
    }
  }

  const handleEdit = (author: Author) => {
    setSelectedAuthor(author)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!authorToDelete) return
    
    try {
      await deleteAuthor.mutateAsync(authorToDelete)
      toast.success('Autor eliminado correctamente')
      setAuthorToDelete(undefined)
    } catch (error) {
      toast.error('Error al eliminar el autor')
      console.error('Error deleting author:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Autores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedAuthor(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Autor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedAuthor ? 'Editar Autor' : 'Nuevo Autor'}
              </DialogTitle>
            </DialogHeader>
            <AuthorForm
              author={selectedAuthor}
              onSubmit={handleSubmit}
              isLoading={createAuthor.isPending || updateAuthor.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p>Cargando autores...</p>
        </div>
      ) : authors.length === 0 ? (
        <div className="flex justify-center">
          <p>No hay autores registrados</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>{author.name}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(author)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAuthorToDelete(author.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!authorToDelete} onOpenChange={(open) => !open && setAuthorToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el autor
              y podría afectar a los libros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}