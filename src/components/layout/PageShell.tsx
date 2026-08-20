import * as React from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface PageShellProps {
  title: string
  description?: string
  primaryAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }
  stats?: {
    label: string
    value: string
    trend?: string
    trendUp?: boolean
  }[]
  children?: React.ReactNode
}

export function PageShell({ title, description, primaryAction, stats, children }: PageShellProps) {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-primary mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-primary/60 font-medium max-w-2xl">
              {description}
            </p>
          )}
        </div>
        
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick} 
            className="self-start md:self-auto h-12 px-8 text-base shadow-soft-lg"
          >
            {primaryAction.icon && <primaryAction.icon className="mr-2 h-5 w-5" />}
            {primaryAction.label}
          </Button>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-[24px] bg-white border border-border p-6 shadow-soft transition-soft hover:-translate-y-1 hover:shadow-soft-lg">
              <p className="text-sm font-bold text-primary/50 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-heading font-black text-primary">{stat.value}</p>
                {stat.trendUp !== undefined && (
                  <span className={`text-sm font-bold mb-1 flex items-center gap-1 ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? '↑' : '↓'} {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
