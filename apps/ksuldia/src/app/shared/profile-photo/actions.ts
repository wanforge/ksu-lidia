"use server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { USER_PHOTO_COLLECTION, deletePhoto, savePhoto } from "@/lib/storage";
import type { PhotoActionState } from "./state";

export type { PhotoActionState };

const PHOTO_ERROR_MESSAGES: Record<string, string> = {
  EMPTY_FILE: "File foto kosong.",
  FILE_TOO_LARGE: "Ukuran foto maksimal 5 MB.",
  UNSUPPORTED_FILE_TYPE: "Format harus JPG, PNG, atau WebP.",
};

/** Unggah/ubah foto profil akun yang sedang login. */
export async function updateOwnPhotoAction(
  _prevState: PhotoActionState,
  formData: FormData
): Promise<PhotoActionState> {
  const session = await getSession();
  if (!session?.user) {
    return {
      success: false,
      message: "Sesi tidak valid. Silakan login ulang.",
    };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Pilih file foto terlebih dahulu." };
  }

  try {
    const userId = session.user.id;
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    const saved = await savePhoto(USER_PHOTO_COLLECTION, userId, file);
    await prisma.user.update({
      where: { id: userId },
      data: { image: saved.storagePath },
    });
    if (current?.image) await deletePhoto(current.image);

    return { success: true, message: "Foto profil diperbarui." };
  } catch (e) {
    const msg =
      e instanceof Error ? PHOTO_ERROR_MESSAGES[e.message] : undefined;
    return { success: false, message: msg ?? "Gagal mengunggah foto." };
  }
}

/** Hapus foto profil akun yang sedang login. */
export async function removeOwnPhotoAction(
  _prevState: PhotoActionState,
  _formData: FormData
): Promise<PhotoActionState> {
  const session = await getSession();
  if (!session?.user) {
    return {
      success: false,
      message: "Sesi tidak valid. Silakan login ulang.",
    };
  }

  try {
    const userId = session.user.id;
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (current?.image) {
      await prisma.user.update({
        where: { id: userId },
        data: { image: null },
      });
      await deletePhoto(current.image);
    }
    return { success: true, message: "Foto profil dihapus." };
  } catch {
    return { success: false, message: "Gagal menghapus foto." };
  }
}
