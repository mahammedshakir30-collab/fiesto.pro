import * as React from "react"
import { FileQuestion, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ElementType
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  onAction,
  icon: Icon = FolderOpen
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-2xl border border-dashed bg-card/50">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
      
      {actionLabel && (
        <Button onClick={onAction} className="bg-primary hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
