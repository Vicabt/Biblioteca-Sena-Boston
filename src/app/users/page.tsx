'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUsers, useDeleteUser } from '@/hooks/use-users'
import { UserList } from '@/components/users/user-list'
import { Button } from '@/components/ui/button'
import { UserDialog } from '@/components/users/user-dialog'
import { UserSearch } from '@/components/users/user-search'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { User } from '@/types/user'

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [userToDelete, setUserToDelete] = useState<string | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  
  const { data: users = [], isLoading } = useUsers()
  const deleteUser = useDeleteUser()

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser.mutateAsync(userToDelete)
      toast.success('Usuario eliminado correctamente')
      setUserToDelete(undefined)
    } catch (error) {
      toast.error('Error al eliminar el usuario')
      console.error('Error deleting user:', error)
    }
  }

  const handleViewLoans = (user: User) => {
    router.push(`/loans?userId=${user.id}`)
  }

  const handleClearance = (user: User) => {
    router.push(`/users/${user.id}/clearance`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex justify-end">
        <UserSearch />
      </div>

      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={(id) => setUserToDelete(id)}
        onViewLoans={handleViewLoans}
        onClearance={handleClearance}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedUser(undefined)
        }}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              y todos sus datos asociados.
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