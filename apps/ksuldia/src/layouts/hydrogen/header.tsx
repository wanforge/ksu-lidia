"use client";

import Link from "next/link";
import AnimatedLogoShort from "@/app/shared/auth-layout/animated-logo-short";
import HamburgerButton from "@/layouts/hamburger-button";
import Sidebar from "@/layouts/hydrogen/sidebar";
import HeaderMenuRight from "@/layouts/header-menu-right";
import StickyHeader from "@/layouts/sticky-header";
import SearchWidget from "@/app/shared/search/search";

export default function Header() {
  return (
    <StickyHeader className="3xl:px-8 4xl:px-10 z-[990] 2xl:py-5">
      <div className="flex w-full max-w-2xl items-center">
        <HamburgerButton
          view={<Sidebar className="static w-full 2xl:w-full" />}
        />
        <Link
          href={"/"}
          aria-label="KSULIDIA"
          className="me-4 w-9 shrink-0 lg:me-5 xl:hidden"
        >
          <AnimatedLogoShort className="h-9 w-9" />
        </Link>

        <SearchWidget />
      </div>

      <HeaderMenuRight />
    </StickyHeader>
  );
}
