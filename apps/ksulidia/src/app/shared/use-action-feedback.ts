"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/app/shared/notify";

type ActionState = { success: boolean; message: string };

/**
 * Tampilkan toast otomatis dari hasil `useActionState`. Setiap kali action
 * menghasilkan state baru dengan `message`, sukses -> toast hijau (lalu jalankan
 * `onSuccess`, mis. refresh/redirect), gagal -> toast merah. State awal (message
 * kosong) diabaikan.
 */
export function useActionFeedback(
  state: ActionState,
  onSuccess?: () => void
): void {
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      notify.success(state.message);
      onSuccessRef.current?.();
    } else {
      notify.error(state.message);
    }
    // Sengaja hanya bergantung pada `state`: useActionState mengembalikan objek
    // baru tiap hasil action, jadi efek ini menyala sekali per hasil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
