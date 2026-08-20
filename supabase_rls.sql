-- Supabase RLS Migration

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE "FestivalOrganizer" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_FestivalOrganizer" ON "FestivalOrganizer";
CREATE POLICY "tenant_isolation_FestivalOrganizer"
ON "FestivalOrganizer"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "TicketTier" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_TicketTier" ON "TicketTier";
CREATE POLICY "tenant_isolation_TicketTier"
ON "TicketTier"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Order" ON "Order";
CREATE POLICY "tenant_isolation_Order"
ON "Order"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Attendee" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Attendee" ON "Attendee";
CREATE POLICY "tenant_isolation_Attendee"
ON "Attendee"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Stage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Stage" ON "Stage";
CREATE POLICY "tenant_isolation_Stage"
ON "Stage"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "LineupSlot" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_LineupSlot" ON "LineupSlot";
CREATE POLICY "tenant_isolation_LineupSlot"
ON "LineupSlot"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Vendor" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Vendor" ON "Vendor";
CREATE POLICY "tenant_isolation_Vendor"
ON "Vendor"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "VendorLeaderboardSnapshot" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_VendorLeaderboardSnapshot" ON "VendorLeaderboardSnapshot";
CREATE POLICY "tenant_isolation_VendorLeaderboardSnapshot"
ON "VendorLeaderboardSnapshot"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "StaffMember" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_StaffMember" ON "StaffMember";
CREATE POLICY "tenant_isolation_StaffMember"
ON "StaffMember"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Announcement" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Announcement" ON "Announcement";
CREATE POLICY "tenant_isolation_Announcement"
ON "Announcement"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Role" ON "Role";
CREATE POLICY "tenant_isolation_Role"
ON "Role"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "UserRole" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_UserRole" ON "UserRole";
CREATE POLICY "tenant_isolation_UserRole"
ON "UserRole"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "StaffInvite" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_StaffInvite" ON "StaffInvite";
CREATE POLICY "tenant_isolation_StaffInvite"
ON "StaffInvite"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "OnboardingStep" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_OnboardingStep" ON "OnboardingStep";
CREATE POLICY "tenant_isolation_OnboardingStep"
ON "OnboardingStep"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteSettings" ON "SiteSettings";
CREATE POLICY "tenant_isolation_SiteSettings"
ON "SiteSettings"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteImage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteImage" ON "SiteImage";
CREATE POLICY "tenant_isolation_SiteImage"
ON "SiteImage"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteGalleryItem" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteGalleryItem" ON "SiteGalleryItem";
CREATE POLICY "tenant_isolation_SiteGalleryItem"
ON "SiteGalleryItem"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteDownload" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteDownload" ON "SiteDownload";
CREATE POLICY "tenant_isolation_SiteDownload"
ON "SiteDownload"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteNewsPost" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteNewsPost" ON "SiteNewsPost";
CREATE POLICY "tenant_isolation_SiteNewsPost"
ON "SiteNewsPost"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SitePage" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SitePage" ON "SitePage";
CREATE POLICY "tenant_isolation_SitePage"
ON "SitePage"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "SiteAnalyticsEvent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_SiteAnalyticsEvent" ON "SiteAnalyticsEvent";
CREATE POLICY "tenant_isolation_SiteAnalyticsEvent"
ON "SiteAnalyticsEvent"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Notification" ON "Notification";
CREATE POLICY "tenant_isolation_Notification"
ON "Notification"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Category" ON "Category";
CREATE POLICY "tenant_isolation_Category"
ON "Category"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Programme" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Programme" ON "Programme";
CREATE POLICY "tenant_isolation_Programme"
ON "Programme"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Team" ON "Team";
CREATE POLICY "tenant_isolation_Team"
ON "Team"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Candidate" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Candidate" ON "Candidate";
CREATE POLICY "tenant_isolation_Candidate"
ON "Candidate"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "ChestNumberRule" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ChestNumberRule" ON "ChestNumberRule";
CREATE POLICY "tenant_isolation_ChestNumberRule"
ON "ChestNumberRule"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "PositionCriteria" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_PositionCriteria" ON "PositionCriteria";
CREATE POLICY "tenant_isolation_PositionCriteria"
ON "PositionCriteria"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "GradeCriteria" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_GradeCriteria" ON "GradeCriteria";
CREATE POLICY "tenant_isolation_GradeCriteria"
ON "GradeCriteria"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Subscription" ON "Subscription";
CREATE POLICY "tenant_isolation_Subscription"
ON "Subscription"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Invoice" ON "Invoice";
CREATE POLICY "tenant_isolation_Invoice"
ON "Invoice"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "ImportJob" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_ImportJob" ON "ImportJob";
CREATE POLICY "tenant_isolation_ImportJob"
ON "ImportJob"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_Template" ON "Template";
CREATE POLICY "tenant_isolation_Template"
ON "Template"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "TeamPointEntry" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_TeamPointEntry" ON "TeamPointEntry";
CREATE POLICY "tenant_isolation_TeamPointEntry"
ON "TeamPointEntry"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "StandingsPublishState" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_StandingsPublishState" ON "StandingsPublishState";
CREATE POLICY "tenant_isolation_StandingsPublishState"
ON "StandingsPublishState"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "PointAdjustment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_PointAdjustment" ON "PointAdjustment";
CREATE POLICY "tenant_isolation_PointAdjustment"
ON "PointAdjustment"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

ALTER TABLE "TopperTemplate" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_TopperTemplate" ON "TopperTemplate";
CREATE POLICY "tenant_isolation_TopperTemplate"
ON "TopperTemplate"
USING (
  "festivalId" IN (
    SELECT "festivalId" FROM "UserRole" WHERE "userId" = current_setting('app.current_user_id', true)::text
  )
);

