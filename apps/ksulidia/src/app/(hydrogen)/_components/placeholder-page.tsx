import Link from "next/link";
import { routes } from "@/config/routes";
import { PiArrowLeftBold } from "react-icons/pi";

type PlaceholderPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  items: string[];
};

export default function PlaceholderPage({
  title,
  eyebrow,
  description,
  items,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <section className="border-b border-gray-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          {description}
        </p>
      </section>

      <section className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-950">
            Urutan pengembangan
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={item}
              className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 px-5 py-4"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-sm font-semibold text-gray-700">
                {index + 1}
              </span>
              <p className="self-center text-sm font-medium text-gray-800">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Link
        href={routes.dashboard}
        className="inline-flex w-fit items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-500"
      >
        <PiArrowLeftBold className="me-2 h-4 w-4" />
        Dashboard
      </Link>
    </div>
  );
}
