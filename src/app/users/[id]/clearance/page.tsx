'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUserLoans } from '@/hooks/use-loans'
import { useUser } from '@/hooks/use-users'
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
  const params = useParams<{ id: string }>()
  const userId = params?.id || ''
  
  // Redirect to the users list if no userId is provided
  useEffect(() => {
    if (!userId) {
      router.push('/users')
      toast.error('ID de usuario no válido')
    }
  }, [userId, router])
  
  const { data: loans = [], isLoading: loansLoading } = useUserLoans(userId)
  const { data: userData, isLoading: userLoading } = useUser(userId)
  const [user, setUser] = useState<User | null>(null)

  const hasActiveLoans = loans.some(loan => loan.status === 'active' || loan.status === 'overdue')
  const overdueLoans = loans.filter(loan => loan.status === 'overdue')
  const activeLoans = loans.filter(loan => loan.status === 'active')
  const returnedLoans = loans.filter(loan => loan.status === 'returned')

  // Set the page title
  useEffect(() => {
    document.title = "Paz y Salvo - Biblioteca SENA";
  }, []);

  // Obtener información del usuario directamente desde Firebase
  useEffect(() => {
    if (userData) {
      setUser(userData)
    } else if (loans.length > 0 && loans[0].user) {
      // Fallback: intentar obtener el usuario desde los préstamos si está disponible
      setUser(loans[0].user as User)
    }
  }, [userData, loans])

  const handleDownload = () => {
    if (!user) {
      toast.error('No hay información del usuario disponible')
      return
    }

    try {
      // Crear un nuevo documento PDF con orientación portrait
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Título
      doc.setFontSize(20)
      const title = hasActiveLoans ? 'Reporte de Estado de Préstamos' : 'Certificado de Paz y Salvo'
      doc.text(title, 105, 20, { align: 'center' })
      doc.setFontSize(16)
      doc.text('Biblioteca SENA', 105, 30, { align: 'center' })
      
      // Información del usuario
      doc.setFontSize(12)
      doc.text('Información del Usuario', 20, 50)
      doc.setFontSize(10)
      
      // Asegurarse de que todos los campos del usuario existan
      const userName = user.name || 'No disponible'
      const userDocumentId = user.documentId || 'No disponible'
      const userEmail = user.email || 'No disponible'
      const userPhone = user.phone || 'No disponible'
      
      doc.text([
        `Nombre: ${userName}`,
        `Documento: ${userDocumentId}`,
        `Email: ${userEmail}`,
        `Teléfono: ${userPhone}`,
      ], 20, 60)

      // Estado de préstamos
      doc.setFontSize(12)
      doc.text('Estado de Préstamos', 20, 90)
      doc.setFontSize(10)
      
      const statusLines = [
        `Total de préstamos realizados: ${loans.length}`,
        `Préstamos devueltos: ${returnedLoans.length}`,
      ]
      
      if (hasActiveLoans) {
        statusLines.push(
          `Préstamos activos: ${activeLoans.length}`,
          `Préstamos vencidos: ${overdueLoans.length}`,
          `\nEl usuario tiene préstamos pendientes por devolver.`
        )
      } else {
        statusLines.push(
          `\nSe certifica que el usuario se encuentra a PAZ Y SALVO con la biblioteca.`,
          `No registra préstamos pendientes ni vencidos a la fecha.`
        )
      }
      
      doc.text(statusLines, 20, 100)

      // Historial de préstamos
      doc.setFontSize(12)
      doc.text('Historial de Préstamos', 20, 140)

      // Preparar datos para la tabla asegurándose de que no haya valores undefined
      const tableData = loans.map(loan => [
        loan.book?.title || 'Sin título',
        formatDate(loan.startDate),
        loan.returnDate ? formatDate(loan.returnDate) : formatDate(loan.dueDate),
        getStatusText(loan.status),
      ])

      // Generar tabla con autoTable
      autoTable(doc, {
        startY: 150,
        head: [['Libro', 'Fecha Préstamo', 'Fecha Devolución', 'Estado']],
        body: tableData,
        didDrawPage: () => {
          // Puedes agregar encabezados o pies de página aquí si es necesario
        }
      })

      // Fecha y firma
      const currentDate = formatDate(new Date())
      // Obtener la posición Y final de la tabla
      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 200
      doc.text(`Fecha de expedición: ${currentDate}`, 20, finalY + 20)
      
      // Guardar PDF
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = hasActiveLoans 
          ? `reporte_prestamos_${userDocumentId}_${timestamp}.pdf` 
          : `paz_y_salvo_${userDocumentId}_${timestamp}.pdf`
        
        doc.save(fileName)
        
        const successMessage = hasActiveLoans 
          ? 'Reporte de préstamos descargado correctamente' 
          : 'Certificado de paz y salvo descargado correctamente'
        toast.success(successMessage)
      } catch (saveError) {
        console.error('Error al guardar el PDF:', saveError)
        toast.error('Error al guardar el documento PDF')
      }
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

  const isLoading = loansLoading || userLoading
  
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