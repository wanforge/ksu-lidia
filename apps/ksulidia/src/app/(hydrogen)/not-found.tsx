import NotFoundView from "@/app/shared/not-found-view";

// Rendered inside the dashboard shell (sidebar + header) for in-app 404s,
// e.g. opening an employee that has just been deactivated/soft-deleted.
export default function NotFound() {
  return <NotFoundView inline />;
}
