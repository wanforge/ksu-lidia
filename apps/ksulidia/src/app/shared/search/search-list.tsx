"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PiArchiveDuotone,
  PiArrowRightBold,
  PiArrowsClockwiseBold,
  PiClockCountdownDuotone,
  PiGaugeDuotone,
  PiMagnifyingGlassBold,
  PiShieldCheckDuotone,
  PiUserDuotone,
  PiUsersThreeDuotone,
  PiCompassDuotone,
  PiXBold,
} from "react-icons/pi";
import { routes } from "@/config/routes";
import type { SearchResponse } from "@/app/api/ksulidia/search/route";
import { pageLinks } from "./page-links.data";

type Hit = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  group: "Halaman" | "Anggota" | "Produk";
  /** Visual: either a named icon or initials for an avatar. */
  icon?: React.ReactNode;
  initials?: string;
};

/** Distinct icon per destination so the page list isn't a wall of clones. */
const PAGE_ICONS: Record<string, React.ReactNode> = {
  [routes.dashboard]: <PiGaugeDuotone className="h-5 w-5" />,
  [routes.me.dashboard]: <PiUserDuotone className="h-5 w-5" />,
  [routes.users.list]: <PiUsersThreeDuotone className="h-5 w-5" />,
  [routes.audit.list]: <PiShieldCheckDuotone className="h-5 w-5" />,
  [routes.dataChangeLog]: <PiClockCountdownDuotone className="h-5 w-5" />,
};

const PAGE_HITS: Hit[] = pageLinks
  .filter((item) => Boolean(item.href))
  .map((item) => ({
    id: `page-${item.href}`,
    title: item.name,
    subtitle: item.href as string,
    href: item.href as string,
    group: "Halaman",
    icon: PAGE_ICONS[item.href as string] ?? (
      <PiCompassDuotone className="h-5 w-5" />
    ),
  }));

function matchPages(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return PAGE_HITS;
  return PAGE_HITS.filter(
    (hit) =>
      hit.title.toLowerCase().includes(q) ||
      hit.subtitle?.toLowerCase().includes(q)
  );
}

const GROUP_META: Record<Hit["group"], { label: string; tone: string }> = {
  Halaman: { label: "Halaman", tone: "text-gray-500" },
  Anggota: {
    label: "Anggota Koperasi",
    tone: "text-red-700 dark:text-red-400 font-bold text-sm",
  },
  Produk: {
    label: "Produk Toko",
    tone: "text-amber-700 dark:text-amber-400 font-bold text-sm",
  },
};

export default function SearchList({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbHits, setDbHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 2) {
      setDbHits([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/ksulidia/search?q=${encodeURIComponent(q)}`
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          const memberHits: Hit[] = (data.members || []).map((m) => ({
            id: m.id,
            title: m.title,
            subtitle: m.subtitle,
            href: m.href,
            group: "Anggota",
            initials: m.title
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase(),
          }));
          const productHits: Hit[] = (data.products || []).map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle,
            href: p.href,
            group: "Produk",
            icon: <PiArchiveDuotone className="h-5 w-5" />,
          }));
          setDbHits([...memberHits, ...productHits]);
        }
      } catch (err) {
        console.error("Search fetch failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const hits = useMemo<Hit[]>(() => {
    const pages = matchPages(searchText);
    if (!searchText.trim()) return pages;
    return [...pages, ...dbHits];
  }, [searchText, dbHits]);

  // Keep the active index in range whenever the result set changes.
  useEffect(() => {
    setActive(0);
  }, [hits.length]);

  function go(href: string) {
    onClose?.();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => Math.min(prev + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[active];
      if (hit) go(hit.href);
    }
  }

  // Scroll the active row into view.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const tooShort = searchText.trim().length < 2;

  // Render hits grouped while preserving the flat index used for navigation.
  let flatIndex = -1;
  const groups: Hit["group"][] = ["Halaman", "Anggota", "Produk"];

  return (
    <div
      className="flex h-[70vh] max-h-[640px] flex-col bg-white dark:bg-gray-100"
      onKeyDown={onKeyDown}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-950">Pencarian</h2>
          <p className="mt-0.5 text-xs text-gray-500">Cari halaman aplikasi.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-me-1 shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Tutup"
        >
          <PiXBold className="h-5 w-5" />
        </button>
      </div>

      {/* Search field */}
      <div className="px-5 pb-2 pt-4">
        <label
          htmlFor="global-search-input"
          className="mb-1.5 block text-xs font-medium text-gray-500"
        >
          Kata kunci
        </label>
        <div className="relative">
          <PiMagnifyingGlassBold className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="global-search-input"
            ref={inputRef}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ketik nama halaman…"
            className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-700"
          />
          {loading ? (
            <PiArrowsClockwiseBold className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          ) : searchText ? (
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Bersihkan"
            >
              <PiXBold className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div
        ref={listRef}
        className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-2 pt-1"
      >
        {hits.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <PiMagnifyingGlassBold className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-semibold text-gray-900">
              {tooShort ? "Mulai mengetik untuk mencari" : "Tidak ada hasil"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              {tooShort
                ? "Cari halaman aplikasi."
                : `Tidak ada yang cocok dengan "${searchText.trim()}".`}
            </p>
          </div>
        ) : (
          groups.map((group) => {
            const groupHits = hits.filter((hit) => hit.group === group);
            if (groupHits.length === 0) return null;
            const meta = GROUP_META[group];
            return (
              <div key={group} className="mb-2">
                <div className="flex items-center justify-between px-2 pb-1 pt-3">
                  <p
                    className={`text-xs font-semibold uppercase tracking-widest ${meta.tone}`}
                  >
                    {meta.label}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                    {groupHits.length}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {groupHits.map((hit) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    const isActive = index === active;
                    return (
                      <Link
                        key={hit.id}
                        href={hit.href}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => onClose?.()}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary ring-primary/20 ring-1"
                            : "text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        {hit.initials ? (
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-red-100 text-red-800 group-hover:bg-red-200"
                            }`}
                          >
                            {hit.initials}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                              isActive
                                ? "border-primary/30 text-primary bg-white"
                                : "border-gray-200 bg-gray-50 text-gray-500 group-hover:border-gray-300 group-hover:text-gray-700"
                            }`}
                          >
                            {hit.icon}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {hit.title}
                          </span>
                          {hit.subtitle ? (
                            <span
                              className={`block truncate text-xs ${
                                isActive ? "text-primary/80" : "text-gray-500"
                              }`}
                            >
                              {hit.subtitle}
                            </span>
                          ) : null}
                        </span>
                        <PiArrowRightBold
                          className={`h-4 w-4 shrink-0 transition-all ${
                            isActive
                              ? "text-primary translate-x-0 opacity-100"
                              : "-translate-x-1 text-gray-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint bar */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5 text-xs text-gray-400">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-sans text-gray-500">
              ↑
            </kbd>
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-sans text-gray-500">
              ↓
            </kbd>
            navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-sans text-gray-500">
              ↵
            </kbd>
            buka
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-sans text-gray-500">
              esc
            </kbd>
            tutup
          </span>
        </span>
        <span className="font-medium">{hits.length} hasil</span>
      </div>
    </div>
  );
}
