"use client";

import dynamic from "next/dynamic";

interface AnalyticsData {
  timeSeries: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
}

const Chart = dynamic(() => import('./WebsiteAnalyticsChart'), { ssr: false, loading: () => <div className="w-full h-full animate-pulse bg-muted rounded-xl" /> });

export function WebsiteAnalyticsClient({ data }: { data: AnalyticsData }) {
  const totalViews = data.timeSeries.reduce((acc, curr) => acc + curr.views, 0);

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-6 shadow-sm col-span-1 md:col-span-3">
          <h3 className="font-bold font-heading text-lg mb-2">Total Views</h3>
          <div className="text-4xl font-bold font-heading">{totalViews.toLocaleString()}</div>
        </div>
        
        <div className="bg-card border rounded-2xl p-6 shadow-sm col-span-1 md:col-span-2">
          <h3 className="font-bold font-heading text-lg mb-4">Views Over Time</h3>
          {data.timeSeries.length > 0 ? (
            <div className="h-[300px]">
              <Chart data={data.timeSeries} />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No traffic data yet.
            </div>
          )}
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold font-heading text-lg mb-4">Top Pages</h3>
          {data.topPages.length > 0 ? (
            <ul className="space-y-4">
              {data.topPages.map(page => (
                <li key={page.path} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate max-w-[150px]">{page.path}</span>
                  <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded-md">{page.views}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-sm">No page views recorded.</div>
          )}
        </div>
      </div>

    </div>
  );
}


