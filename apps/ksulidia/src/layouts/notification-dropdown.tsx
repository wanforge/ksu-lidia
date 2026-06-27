"use client";

import Link from "next/link";
import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { playNotificationSound } from "@/lib/audio";
import {
  PiBellSimpleBold,
  PiClockCountdownBold,
  PiShieldCheckBold,
  PiShieldWarningBold,
  PiWarningCircleBold,
} from "react-icons/pi";
import { Badge, Popover, Text, Title } from "rizzui";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "danger" | "warning" | "info";
};

const toneStyles: Record<NotificationItem["tone"], string> = {
  danger: "bg-red-lighter/40 text-red",
  warning: "bg-orange-lighter/40 text-orange-dark",
  info: "bg-primary-lighter/30 text-primary-dark",
};

function ToneIcon({
  tone,
  id,
}: {
  tone: NotificationItem["tone"];
  id: string;
}) {
  if (id.startsWith("data-request-") || id === "pending-data-requests")
    return <PiShieldWarningBold className="h-5 w-5" />;
  if (tone === "info") return <PiShieldCheckBold className="h-5 w-5" />;
  if (tone === "danger") return <PiWarningCircleBold className="h-5 w-5" />;
  return <PiClockCountdownBold className="h-5 w-5" />;
}

function NotificationsList({
  items,
  loading,
  setIsOpen,
}: {
  items: NotificationItem[];
  loading: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[400px] rtl:text-right">
      <div className="mb-2 flex items-center justify-between pe-1 ps-6">
        <Title as="h5" fontWeight="semibold">
          Notifikasi
        </Title>
      </div>
      <div className="custom-scrollbar max-h-[420px] overflow-y-auto scroll-smooth">
        {loading ? (
          <Text className="px-6 py-8 text-center text-sm text-gray-500">
            Memuat...
          </Text>
        ) : items.length === 0 ? (
          <Text className="px-6 py-8 text-center text-sm text-gray-500">
            Tidak ada notifikasi.
          </Text>
        ) : (
          <div className="grid grid-cols-1 gap-1 ps-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded ${toneStyles[item.tone]}`}
                >
                  <ToneIcon tone={item.tone} id={item.id} />
                </div>
                <div className="min-w-0">
                  <Text className="truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                    {item.title}
                  </Text>
                  <Text className="truncate text-xs text-gray-500">
                    {item.description}
                  </Text>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Track ID notifikasi yang sudah terlihat agar tone dipilih berdasarkan tipe
  // notifikasi baru, bukan sekadar perubahan jumlah.
  const prevIdsRef = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ksulidia/notifications", {
        cache: "no-store",
      });
      const data = res.ok ? await res.json() : { items: [] };
      const incoming: NotificationItem[] = data.items ?? [];

      // Bandingkan dengan ID sebelumnya untuk deteksi notifikasi benar-benar baru.
      // Lewati saat mount pertama (prevIdsRef masih null).
      if (prevIdsRef.current !== null) {
        const newItems = incoming.filter((i) => !prevIdsRef.current!.has(i.id));
        if (newItems.length > 0) {
          // Pilih tone berdasarkan severity tertinggi notifikasi baru:
          // danger (permintaan ditolak, dokumen kritis) → error
          // warning (permintaan pending, hampir kedaluwarsa)  → warning
          // info (verifikasi, permintaan disetujui)           → notification
          const hasDanger = newItems.some((i) => i.tone === "danger");
          const hasWarning = newItems.some((i) => i.tone === "warning");
          playNotificationSound(
            hasDanger ? "error" : hasWarning ? "warning" : "notification"
          );
        }
      }
      prevIdsRef.current = new Set(incoming.map((i) => i.id));

      setItems(incoming);
    } catch {
      // Abaikan kegagalan polling; coba lagi di interval berikutnya.
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling ringan (tanpa socket): muat saat mount, refresh tiap 45 detik, saat
  // tab kembali aktif, dan saat dropdown dibuka. Cukup untuk notifikasi HR.
  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      <Popover.Trigger>
        <span className="relative inline-flex">
          {children}
          {!loading && items.length > 0 ? (
            <Badge
              renderAsDot
              color="warning"
              enableOutlineRing
              className="absolute right-1 top-1 -translate-y-1/3 translate-x-1/2"
            />
          ) : null}
        </span>
      </Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden sm:[&>svg]:inline-flex [&>svg]:dark:fill-gray-100">
        <NotificationsList
          items={items}
          loading={loading}
          setIsOpen={setIsOpen}
        />
      </Popover.Content>
    </Popover>
  );
}
