import Link from "next/link";

import WanForgeIcon from "@/components/wanforge-icon";
import { appConfig } from "@/config/app";

export default function AppFooter() {
  const year = new Date().getFullYear();
  const orgDisplay = appConfig.orgName || appConfig.name;

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/60 px-4 py-4 text-center text-xs text-gray-500 backdrop-blur lg:px-8 dark:border-gray-800 dark:bg-gray-950/60">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <span>
          © {year}{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {orgDisplay}
          </span>
          . Hak cipta dilindungi undang-undang.
        </span>
        <span className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
          >
            Kebijakan Privasi
          </Link>
          <span aria-hidden className="opacity-40">
            ·
          </span>
          <Link
            href="/terms"
            className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
          >
            Ketentuan Layanan
          </Link>
        </span>
        <a
          href="https://wanforge.asia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <WanForgeIcon className="h-3.5 w-auto" />
          WanForge
          <span className="font-normal opacity-60">· Forge Clarity</span>
        </a>
      </div>
    </footer>
  );
}
