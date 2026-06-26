"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "rizzui";
import { notify } from "@/app/shared/notify";
import { confirmDelete } from "@/app/shared/confirm";
import { removeOwnPhotoAction, updateOwnPhotoAction } from "./actions";
import { initialPhotoActionState } from "./state";
import { Button } from "@/components/ui/button";

/** Avatar akun + kontrol ganti/hapus foto profil (dipakai di menu profil). */
export default function ProfilePhotoUploader() {
  const { data: session, update } = useSession();
  const name = session?.user?.name ?? "Pengguna";
  const image = session?.user?.image ?? undefined;

  const uploadFormRef = useRef<HTMLFormElement>(null);
  const removeFormRef = useRef<HTMLFormElement>(null);

  const [uploadState, uploadAction, uploadPending] = useActionState(
    updateOwnPhotoAction,
    initialPhotoActionState
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeOwnPhotoAction,
    initialPhotoActionState
  );

  useEffect(() => {
    if (!uploadState.message) return;
    if (uploadState.success) {
      notify.success(uploadState.message);
      update();
    } else {
      notify.error(uploadState.message);
    }
  }, [uploadState, update]);

  useEffect(() => {
    if (!removeState.message) return;
    if (removeState.success) {
      notify.success(removeState.message);
      update();
    } else {
      notify.error(removeState.message);
    }
  }, [removeState, update]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Avatar name={name} src={image} className="!h-14 !w-14" />
      <form ref={uploadFormRef} action={uploadAction}>
        <label
          className={`cursor-pointer text-xs font-semibold text-teal-700 hover:text-teal-900 ${
            uploadPending ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          {uploadPending
            ? "Mengunggah..."
            : image
              ? "Ubah foto"
              : "Tambah foto"}
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploadPending}
            onChange={(event) => {
              if (event.target.files?.length) {
                uploadFormRef.current?.requestSubmit();
              }
            }}
          />
        </label>
      </form>
      {image ? (
        <form ref={removeFormRef} action={removeAction}>
          <Button
            type="button"
            variant="ghost"
            isLoading={removePending}
            onClick={async () => {
              if (await confirmDelete("foto profil")) {
                removeFormRef.current?.requestSubmit();
              }
            }}
            className="px-0 font-medium text-rose-700 hover:bg-transparent hover:text-rose-900"
          >
            Hapus foto
          </Button>
        </form>
      ) : null}
    </div>
  );
}
