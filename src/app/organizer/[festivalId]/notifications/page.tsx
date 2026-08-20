import { getNotifications } from "@/actions/notifications";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage({ params, searchParams }: { params: { festivalId: string }, searchParams: { page?: string, filter?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);
  const unreadOnly = searchParams.filter === "unread";
  
  const notificationsData = await getNotifications(params.festivalId, page, 20, unreadOnly);
  
  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsClient 
        festivalId={params.festivalId} 
        initialData={notificationsData} 
        currentPage={page}
        currentFilter={unreadOnly ? 'unread' : 'all'}
      />
    </div>
  );
}
