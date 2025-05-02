'use client'

import { Suspense } from 'react'
import { StatCard } from "@/components/dashboard/stat-card"
import { BookIcon, BookOpenCheckIcon, AlertCircleIcon, UsersIcon } from "lucide-react"
import { useStats } from "@/hooks/use-stats"

function DashboardContent() {
  const { data: stats, isLoading } = useStats()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Libros"
          value={isLoading ? 0 : stats?.totalBooks ?? 0}
          subtitle="en el catálogo"
          icon={<BookIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Libros Prestados"
          value={isLoading ? 0 : stats?.loanedBooks ?? 0}
          subtitle="actualmente"
          icon={<BookOpenCheckIcon className="h-6 w-6" />}
        />
        
        <StatCard
          title="Libros Vencidos"
          value={isLoading ? 0 : stats?.overdueBooks ?? 0}
          subtitle="requieren atención"
          icon={<AlertCircleIcon className="h-6 w-6" color="red" />}
        />

        <StatCard
          title="Usuarios Registrados"
          value={isLoading ? 0 : stats?.registeredUsers ?? 0}
          subtitle="en el sistema"
          icon={<UsersIcon className="h-6 w-6" />}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
