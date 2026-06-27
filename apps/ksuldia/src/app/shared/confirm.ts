"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type ConfirmOptions = {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  icon?: "warning" | "question" | "info" | "success" | "error";
};

/** Dialog konfirmasi (SweetAlert2) bergaya brand. Mengembalikan true bila Ya. */
export async function confirmAction(
  options: ConfirmOptions = {}
): Promise<boolean> {
  const result = await Swal.fire({
    title: options.title ?? "Anda yakin?",
    text: options.text,
    icon: options.icon ?? "warning",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Ya, lanjutkan",
    cancelButtonText: options.cancelText ?? "Batal",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "rounded-xl",
      title: "!text-lg !font-bold !text-gray-900",
      htmlContainer: "!text-sm !text-gray-600",
      actions: "!gap-2",
      confirmButton: options.danger
        ? "rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        : "rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700",
      cancelButton:
        "rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-500",
    },
  });
  return result.isConfirmed;
}

/** Pintasan konfirmasi hapus (tombol merah). */
export function confirmDelete(name?: string): Promise<boolean> {
  return confirmAction({
    title: "Hapus data ini?",
    text: name
      ? `"${name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`
      : "Tindakan ini tidak bisa dibatalkan.",
    confirmText: "Ya, hapus",
    danger: true,
  });
}
