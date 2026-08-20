import { PageShell } from "./PageShell"

export function DataTableSkeleton({ rows = 5, columns = 5 }: { rows?: number, columns?: number }) {
  return (
    <div className="rounded-[24px] border border-border bg-white shadow-soft overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#F4F3F9]/50 border-b border-border/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-6 flex-1 bg-primary/5 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4 hover:bg-[#F4F3F9]/30 transition-colors">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={`h-5 rounded-md animate-pulse ${colIndex === 0 ? 'bg-primary/10 w-3/4' : 'bg-muted w-1/2'}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/50 bg-[#F4F3F9]/30 flex justify-between items-center">
        <div className="h-5 w-24 bg-muted rounded-md animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-primary/5 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 bg-primary/10 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
