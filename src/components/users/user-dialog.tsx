'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useCreateUser, useUpdateUser } from '@/hooks/use-users'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { User } from '@/types/user'

interface UserDialogProps {
  user?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
}

export function UserDialog({ user, open, onOpenChange, onClose }: UserDialogProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      documentId: user?.documentId || '',
      phone: user?.phone || '',
      role: user?.role || 'student',
      formation: user?.formation || '',
      groupNumber: user?.groupNumber || '',
      status: user?.status || 'active',
      active: true
    }
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, ...data })
        toast.success('Usuario actualizado correctamente')
      } else {
        await createUser.mutateAsync(data)
        toast.success('Usuario creado correctamente')
      }
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el usuario')
      console.error('Error saving user:', error)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="documentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Documento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el número de documento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el nombre completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Ingrese el correo electrónico" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el número de teléfono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="teacher">Profesor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formación</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el nombre de la formación" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Ficha</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese el número de ficha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 space-x-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending || updateUser.isPending}
              >
                {createUser.isPending || updateUser.isPending
                  ? 'Guardando...'
                  : user
                  ? 'Actualizar'
                  : 'Crear'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 