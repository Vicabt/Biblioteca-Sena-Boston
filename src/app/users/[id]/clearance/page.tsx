'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUserLoans } from '@/hooks/use-loans'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'
import type { Loan } from '@/types/loan'
import type { User } from '@/types/user'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function UserClearancePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { data: loans = [], isLoading } = useUserLoans(userId)
  const [user, setUser] = useState<User | null>(null)

  const hasActiveLoans = loans.some(loan => loan.status === 'active' || loan.status === 'overdue')
  const overdueLoans = loans.filter(loan => loan.status === 'overdue')
  const activeLoans = loans.filter(loan => loan.status === 'active')
  const returnedLoans = loans.filter(loan => loan.status === 'returned')

  useEffect(() => {
    if (loans.length > 0 && loans[0].user) {
      setUser(loans[0].user as User)
    }
  }, [loans])

  const handleDownload = () => {
    if (!user || hasActiveLoans) return

    try {
      const doc = new jsPDF()
      
      // Título
      doc.setFontSize(20)
      doc.text('Certificado de Paz y Salvo', 105, 20, { align: 'center' })
      doc.setFontSize(16)
      doc.text('Biblioteca SENA', 105, 30, { align: 'center' })
      
      // Información del usuario
      doc.setFontSize(12)
      doc.text('Información del Usuario', 20, 50)
      doc.setFontSize(10)
      doc.text([
        `Nombre: ${user.name}`,
        `Documento: ${user.documentId}`,
        `Email: ${user.email}`,
        `Teléfono: ${user.phone}`,
      ], 20, 60)

      // Estado de préstamos
      doc.setFontSize(12)
      doc.text('Estado de Préstamos', 20, 90)
      doc.setFontSize(10)
      doc.text([
        `Total de préstamos realizados: ${loans.length}`,
        `Préstamos devueltos: ${returnedLoans.length}`,
        `\nSe certifica que el usuario se encuentra a PAZ Y SALVO con la biblioteca.`,
        `No registra préstamos pendientes ni vencidos a la fecha.`,
      ], 20, 100)

      // Historial de préstamos
      doc.setFontSize(12)
      doc.text('Historial de Préstamos', 20, 140)

      const tableData = loans.map(loan => [
        loan.book?.title || '',
        formatDate(loan.startDate),
        loan.returnDate ? formatDate(loan.returnDate) : formatDate(loan.dueDate),
        getStatusText(loan.status),
      ])

      autoTable(doc, {
        startY: 150,
        head: [['Libro', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']],
        body: tableData,
      })

      // Fecha y firma
      const currentDate = formatDate(new Date())
      const finalY = (doc as any).lastAutoTable.finalY || 200
      doc.text(`Fecha de expedición: ${currentDate}`, 20, finalY + 20)
      
      // Guardar PDF
      doc.save(`paz_y_salvo_${user.documentId}.pdf`)
      toast.success('Paz y salvo descargado correctamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error al generar el paz y salvo')
    }
  }

  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 dark:text-green-500'
      case 'overdue':
        return 'bg-red-500/20 text-red-700 dark:text-red-500'
      case 'returned':
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-500'
      default:
        return ''
    }
  }

  const getStatusText = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'overdue':
        return 'Vencido'
      case 'returned':
        return 'Devuelto'
      default:
        return status
    }
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Paz y Salvo</h1>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Nombre</dt>
                <dd className="text-foreground font-medium">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Documento</dt>
                <dd className="text-foreground font-medium">{user.documentId}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-foreground font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Teléfono</dt>
                <dd className="text-foreground font-medium">{user.phone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado de Préstamos</CardTitle>
            <Button 
              variant="outline" 
              disabled={hasActiveLoans}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Paz y Salvo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="text-2xl font-bold">{activeLoans.length}</div>
              <div className="text-sm text-muted-foreground">Préstamos Activos</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-2xl font-bold">{overdueLoans.length}</div>
              <div className="text-sm text-muted-foreground">Préstamos Vencidos</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-2xl font-bold">{returnedLoans.length}</div>
              <div className="text-sm text-muted-foreground">Préstamos Devueltos</div>
            </div>
          </div>

          {hasActiveLoans ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              El usuario tiene préstamos pendientes por devolver
            </div>
          ) : (
            <div className="bg-green-500/10 text-green-700 dark:text-green-500 p-4 rounded-lg">
              El usuario está a paz y salvo con la biblioteca
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libro</TableHead>
                <TableHead>Fecha Préstamo</TableHead>
                <TableHead>Fecha Devolución</TableHead>
                <TableHead>Estado</TableHead>
                {hasActiveLoans && <TableHead>Días Restantes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const daysLeft = loan.status === 'active' 
                  ? Math.ceil((loan.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.book?.title}</TableCell>
                    <TableCell>{formatDate(loan.startDate)}</TableCell>
                    <TableCell>
                      {loan.returnDate ? formatDate(loan.returnDate) : formatDate(loan.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(loan.status)}>
                        {getStatusText(loan.status)}
                      </Badge>
                    </TableCell>
                    {hasActiveLoans && (
                      <TableCell>
                        {daysLeft !== null && (
                          <span className={daysLeft < 0 ? 'text-destructive' : ''}>
                            {daysLeft} días
                          </span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 