"use client";

import { Provider as JotaiProvider } from "jotai";
import React from "react";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
