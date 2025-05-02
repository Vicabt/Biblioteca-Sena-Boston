import { Card } from "@/components/ui/card"

export function LoanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-[200px] animate-pulse" />
      ))}
    </div>
  )
} 