"use client";
export default function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m2 2 20 20"/><path d="M8.5 8.5C10 7.7 11.7 7.5 13.5 7.5c2.5 0 4.8.8 6.7 2.2"/><path d="M16 16c1.5-.7 2.8-1.8 3.8-3.1"/><path d="M22 7.1c-1.2-1.2-2.7-2.1-4.4-2.7"/><path d="M5 5c-1.3.8-2.5 1.7-3.5 2.8"/></svg>
      </div>
      <h1 className="text-3xl font-bold font-heading mb-4">You're Offline</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        It looks like you've lost your connection. We are showing you the last cached version of this page where possible. 
        For fresh data, please reconnect to the internet.
      </p>
      <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#504E76] hover:bg-[#504E76]/90 text-white font-bold rounded-xl shadow-lg">
        Try Reconnecting
      </button>
    </div>
  )
}

