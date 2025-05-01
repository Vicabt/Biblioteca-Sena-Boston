import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  icon: ReactNode
}

export function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
    </div>
  )
} 