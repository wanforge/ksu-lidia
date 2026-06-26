import { ListPageSkeleton } from "./_components/skeleton";

// Group-level fallback: applies to any (hydrogen) route without its own loading.
export default function Loading() {
  return <ListPageSkeleton />;
}
