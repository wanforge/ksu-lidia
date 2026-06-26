"use client";

import { Toaster } from "react-hot-toast";

/**
 * Global toast host. Mounted once in the root layout so any `toast()` /
 * `notify.*` call anywhere in the app renders. Styled to match the teal brand.
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: "14px",
          borderRadius: "8px",
          padding: "10px 14px",
          color: "#111827",
          border: "1px solid #e5e7eb",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        },
        success: {
          duration: 4000,
          iconTheme: { primary: "#14b8a6", secondary: "#ffffff" },
          style: { border: "1px solid #99f6e4" },
        },
        error: {
          duration: 6000,
          iconTheme: { primary: "#e11d48", secondary: "#ffffff" },
          style: { border: "1px solid #fecdd3" },
        },
      }}
    />
  );
}
