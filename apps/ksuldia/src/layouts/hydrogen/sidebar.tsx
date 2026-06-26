"use client";

import cn from "@core/utils/class-names";
import Link from "next/link";
import { SidebarMenu } from "./sidebar-menu";
import { appConfig } from "@/config/app";
import AnimatedLogo from "@/app/shared/auth-layout/animated-logo";

export default function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white 2xl:w-72 dark:bg-gray-100/50",
        className
      )}
    >
      <div className="bg-gray-0/10 sticky top-0 z-40 px-6 pb-5 pt-5 2xl:px-8 2xl:pt-6 dark:bg-gray-100/5">
        <Link href={"/"} aria-label={appConfig.name} className="inline-block">
          <AnimatedLogo float={false} className="h-auto w-[184px]" />
        </Link>
      </div>

      <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto scroll-smooth">
        <SidebarMenu />
      </div>
    </aside>
  );
}
