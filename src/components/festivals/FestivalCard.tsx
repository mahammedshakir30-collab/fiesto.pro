import * as React from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, ListVideo, MoreVertical } from "lucide-react"
import { FestivalWithRelations } from "@/actions/festivals"
import { Button } from "@/components/ui/button"

export function FestivalCard({ festival }: { festival: FestivalWithRelations }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE": return "bg-success text-white"
      case "PUBLISHED": return "bg-primary text-white"
      case "DRAFT": return "bg-muted text-muted-foreground"
      case "COMPLETED": return "bg-foreground text-background"
      case "ARCHIVED": return "bg-destructive text-white"
      default: return "bg-primary text-white"
    }
  }

  return (
    <div className="group rounded-2xl border bg-card overflow-hidden shadow-soft transition-soft hover:shadow-soft-lg flex flex-col h-full">
      {/* Banner & Logo */}
      <div className="relative h-32 w-full bg-muted overflow-hidden">
        {festival.coverImageUrl && (
          <img 
            src={festival.coverImageUrl} 
            alt={festival.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${getStatusColor(festival.status)}`}>
            {festival.status}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-heading font-bold text-lg leading-tight line-clamp-1" title={festival.name}>
              {festival.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{festival.coOrganizers[0]?.organizer.companyName || "Independent"}</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1 -mr-2">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            Music
          </span>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>{festival.startDate.toLocaleDateString()} to {festival.endDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-70" />
            <span className="truncate">{festival.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-auto mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-heading font-bold text-foreground">{festival.ticketTiers.reduce((acc, t) => acc + t.soldCount, 0)}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Tickets Sold
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-heading font-bold text-foreground">{festival.stages.length}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ListVideo className="h-3 w-3" /> Stages
            </span>
          </div>
        </div>

        <Button className="w-full bg-action hover:bg-action/90 text-white" asChild>
          <Link href={`/organizer/${festival.id}`}>
            Manage Festival
          </Link>
        </Button>
      </div>
    </div>
  )
}
