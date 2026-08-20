export type UserRole = 'super_admin' | 'organizer' | 'vendor' | 'attendee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type FestivalStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled' | 'DRAFT' | 'PUBLISHED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface Festival {
  id: string;
  organizerId?: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  status: FestivalStatus;
  coverImageUrl?: string | null;
  competitionModeEnabled: boolean;
  chestNumberAutoGenerate: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Organizer {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = 'active' | 'sold_out' | 'hidden' | 'ACTIVE' | 'SOLD_OUT' | 'HIDDEN';

export interface TicketTier {
  id: string;
  festivalId: string;
  name: string; // e.g. "Early Bird GA", "VIP All Access"
  description?: string | null;
  price: number; // in cents or standard currency units
  currency: string;
  capacity: number;
  soldCount: number;
  status: TicketStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'failed' | 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface Order {
  id: string;
  festivalId: string;
  userId: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  id: string;
  orderId: string;
  userId: string;
  festivalId: string;
  ticketTierId: string;
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  genre: string[];
  spotifyUrl?: string | null;
  instagramUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Stage {
  id: string;
  festivalId: string;
  name: string;
  capacity?: number | null;
  indoor: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LineupSlot {
  id: string;
  festivalId: string;
  stageId: string;
  artistId: string;
  startTime: string | Date;
  endTime: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  artist?: Artist;
  stage?: Stage;
}

export type VendorCategory = 'food' | 'merch' | 'beverage' | 'experience' | 'other' | 'FOOD' | 'MERCH' | 'BEVERAGE' | 'EXPERIENCE' | 'OTHER';
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';

export interface Vendor {
  id: string;
  festivalId: string;
  userId: string; // the vendor owner
  name: string;
  description: string | null;
  category: VendorCategory;
  status: VendorStatus;
  boothNumber?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type StaffRole = 'admin' | 'manager' | 'security' | 'scan_team' | 'vendor_ops' | 'ADMIN' | 'MANAGER' | 'SECURITY' | 'SCAN_TEAM' | 'VENDOR_OPS';

export interface StaffMember {
  id: string;
  festivalId: string;
  userId: string;
  role: StaffRole;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

export interface Announcement {
  id: string;
  festivalId: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  sendPushNotification: boolean;
  publishedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Competition & Judging Types
export type ProgrammeType = 'INDIVIDUAL' | 'GROUP';
export type JudgmentMethod = 'MANUAL_SCORE' | 'POSITION_ONLY' | 'GRADE_ONLY';

export interface Category {
  id: string;
  festivalId: string;
  name: string;
  candidateMaxPoints: number;
  teamMaxPoints: number;
}

export interface Section {
  id: string;
  categoryId: string;
  classification: string;
  name: string;
}

export interface Programme {
  id: string;
  festivalId: string;
  categoryId: string;
  name: string;
  code: string;
  type: ProgrammeType;
  judgmentMethod: JudgmentMethod;
  venueId?: string | null;
  scheduledAt?: string | Date | null;
  status: string;
}

export interface Curb {
  id: string;
  programmeId: string;
  maxEntriesPerTeam?: number | null;
  maxEntriesPerCategory?: number | null;
  maxPointsPerCandidate?: number | null;
  maxPointsPerTeam?: number | null;
}

export interface Team {
  id: string;
  festivalId: string;
  name: string;
}

export interface Candidate {
  id: string;
  festivalId: string;
  categoryId: string;
  teamId?: string | null;
  name: string;
  chestNumber?: string | null;
  gender?: string | null;
}

export interface Registration {
  id: string;
  programmeId: string;
  candidateId: string;
  topicTitle?: string | null;
  substitutedForId?: string | null;
  createdAt: string | Date;
}

export interface ChestNumberRule {
  id: string;
  festivalId: string;
  code: string;
  priority: number;
  teamScope: string;
  categoryScope: string;
  prefix?: string | null;
  startAt: number;
}



export interface PointAdjustment {
  id: string;
  festivalId: string;
  candidateId?: string | null;
  teamId?: string | null;
  delta: number;
  reason: string;
  createdBy: string;
  createdAt: string | Date;
}

export interface TopperTemplate {
  id: string;
  festivalId: string;
  name: string;
  scope: string;
  groupBy: any;
  compareBy: string;
  winnerCount: number;
  genderFilter: string;
  tieBreakers: any;
  active: boolean;
}

export interface ResultRelease {
  id: string;
  programmeId: string;
  releasedBy: string;
  releasedAt: string | Date;
}
