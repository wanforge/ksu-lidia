import {
  PageHeaderSkeleton,
  StatCardsSkeleton,
  CardSkeleton,
} from "@/app/(hydrogen)/_components/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <CardSkeleton lines={8} />
        <CardSkeleton lines={8} />
      </div>
    </div>
  );
}
