import HydrogenLayout from "@/layouts/hydrogen/layout";
import { StoreProvider } from "@/store/StoreProvider";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <HydrogenLayout>{children}</HydrogenLayout>
    </StoreProvider>
  );
}
