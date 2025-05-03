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
import { CategoryForm } from '@/components/categories/category-form'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types/category'
import { AddCategoriesButton } from '@/components/categories/add-categories-button'

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const handleSubmit = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({ id: selectedCategory.id, ...data })
        toast.success('Categoría actualizada correctamente')
      } else {
        await createCategory.mutateAsync(data)
        toast.success('Categoría creada correctamente')
      }
      setIsDialogOpen(false)
      setSelectedCategory(undefined)
    } catch (error) {
      toast.error('Error al guardar la categoría')
      console.error('Error saving category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory.mutateAsync(categoryToDelete)
      toast.success('Categoría eliminada correctamente')
      setCategoryToDelete(undefined)
    } catch (error) {
      toast.error('Error al eliminar la categoría')
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCategory(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleSubmit}
              isLoading={createCategory.isPending || updateCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <p>Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col justify-center space-y-4">
          <p>No hay categorías registradas</p>
          <div className="max-w-md mx-auto w-full">
            <AddCategoriesButton />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCategoryToDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="max-w-md mx-auto w-full">
            <AddCategoriesButton />
          </div>
        </div>
      )}

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría
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