'use client'

import { useEffect, useState } from 'react'
import { useLoans } from '@/hooks/use-loans'
import { formatDate } from '@/lib/utils/dates'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Loan } from '@/types/loan'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

interface LoanPage {
  loans: Loan[]
  hasMore: boolean
  lastDoc: QueryDocumentSnapshot | undefined
}

export default function AlertsPage() {
  const { data } = useLoans()
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([])

  useEffect(() => {
    if (data?.pages) {
      const now = new Date()
      const allLoans = data.pages.flatMap(page => (page as LoanPage).loans)
      const overdue = allLoans.filter(loan => 
        loan.status === 'active' && loan.dueDate < now
      ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()) // Ordenar por fecha de vencimiento
      setOverdueLoans(overdue)
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alertas de Devolución</h1>
      </div>

      {overdueLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay préstamos vencidos</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Libro</TableHead>
              <TableHead>Fecha Préstamo</TableHead>
              <TableHead>Fecha Devolución</TableHead>
              <TableHead>Días Vencido</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueLoans.map((loan) => {
              const daysOverdue = Math.ceil(
                (new Date().getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              
              return (
                <TableRow key={loan.id} className="bg-destructive/10">
                  <TableCell>{loan.user?.name}</TableCell>
                  <TableCell>{loan.user?.phone}</TableCell>
                  <TableCell>{loan.book?.title}</TableCell>
                  <TableCell>{formatDate(loan.startDate)}</TableCell>
                  <TableCell>{formatDate(loan.dueDate)}</TableCell>
                  <TableCell>{daysOverdue} días</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`tel:${loan.user?.phone}`)}
                      title="Llamar"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 