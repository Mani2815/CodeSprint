import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamsLoading() {
  return (
    <>
      <Navbar />
      <main className="container max-w-6xl py-10 sm:py-14">
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="pt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-6 h-4 w-full" />

                <div className="mt-auto space-y-4">
                  <div>
                    <Skeleton className="mb-3 h-4 w-24" />
                    <div className="flex -space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
                      <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
                      <Skeleton className="h-8 w-8 rounded-full border-2 border-background" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-5 w-32 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
