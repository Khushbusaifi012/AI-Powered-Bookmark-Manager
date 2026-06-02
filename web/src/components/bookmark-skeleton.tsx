import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BookmarkSkeletonProps = {
  view?: "grid" | "list";
};

export function BookmarkSkeleton({ view = "grid" }: BookmarkSkeletonProps) {
  if (view === "list") {
    return (
      <Card className="flex gap-4 p-4">
        <div className="skeleton h-16 w-16 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-2/3 rounded-lg" />
          <div className="skeleton h-3 w-full rounded-lg" />
          <div className="skeleton h-3 w-1/3 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="skeleton h-36 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
      </div>
    </Card>
  );
}

export function BookmarkSkeletonGrid({
  view = "grid",
  count = 6,
}: BookmarkSkeletonProps & { count?: number }) {
  return (
    <div
      className={cn(
        view === "grid"
          ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-3",
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <BookmarkSkeleton key={index} view={view} />
      ))}
    </div>
  );
}
