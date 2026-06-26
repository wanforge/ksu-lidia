"use client";

import { createElement } from "react";
import toast from "react-hot-toast";
import { PiWarningCircleFill } from "react-icons/pi";

import { playNotificationSound } from "@/lib/audio";

/** Pembungkus react-hot-toast + audio notifikasi. */
export const notify = {
  success: (message: string) => {
    playNotificationSound("success");
    return toast.success(message);
  },
  error: (message: string) => {
    playNotificationSound("error");
    return toast.error(message);
  },
  warning: (message: string) => {
    playNotificationSound("warning");
    return toast(message, {
      icon: createElement(PiWarningCircleFill, {
        className: "text-amber-500",
        style: { width: "20px", height: "20px", flexShrink: 0 },
      }),
    });
  },
  info: (message: string) => {
    playNotificationSound("info");
    return toast(message);
  },
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string) => toast.dismiss(id),
};
