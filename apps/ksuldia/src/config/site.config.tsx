import { Metadata } from "next";
import logoImg from "@public/logo.svg";
import logoIconImg from "@public/logo-short.svg";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { LAYOUT_OPTIONS } from "./enums";

enum MODE {
  DARK = "dark",
  LIGHT = "light",
}

export const siteConfig = {
  title: "KSU Lidia - Koperasi Simpan Pinjam & Toko GKJ Manahan",
  description: "Sistem Informasi Manajemen Anggota, Simpan Pinjam, dan Retail Toko KSU Lidia GKJ Manahan.",
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - KSU Lidia` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - KSU Lidia` : title,
      description,
      url: "https://ksulidiagkjmanahan.com",
      siteName: "KSU Lidia",
      images: {
        url: "/logo.svg",
        width: 1200,
        height: 630,
      },
      locale: "id_ID",
      type: "website",
    },
  };
};
