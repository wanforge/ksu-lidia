import { randomUUID } from "node:crypto";
import path from "node:path";
import { env } from "@/config/env";
import { type ReadableObject, type StorageDriver } from "./driver";
import { LocalStorageDriver } from "./local-driver";
import { S3StorageDriver } from "./s3-driver";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Each module/model stores under its own collection folder inside the storage
// root (e.g. ./storage/employee-documents/<id>/<file>). Add new constants per
// model as more document-owning modules appear.
export const EMPLOYEE_DOCUMENT_COLLECTION = "employee-documents";

// Soft-deleted files are moved here, keeping their original sub-path, e.g.
// employee-documents/<id>/<file> → .trash/employee-documents/<id>/<file>.
export const TRASH_PREFIX = ".trash";

// Foto: foto profil akun (user). Disimpan terpisah dari
// dokumen agar mudah dikelola/diserahkan lewat route serving sendiri.
export const EMPLOYEE_PHOTO_COLLECTION = "employee-photos";
export const USER_PHOTO_COLLECTION = "user-photos";
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
export const PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type SavedDocumentFile = {
  originalName: string;
  archiveName: string;
  mimeType: string;
  size: number;
  storagePath: string;
};

function getExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension.length > 0 ? extension : ".bin";
}

export function normalizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Build a collision-resistant archive name preserving the original extension. */
export function buildArchiveName(fileName: string) {
  const safeName = normalizeFileName(
    fileName || `document${getExtension(fileName)}`
  );
  return `${Date.now()}-${randomUUID()}-${safeName}`;
}

let driver: StorageDriver | undefined;

function createDriver(): StorageDriver {
  // FILESYSTEM_DISK follows the Laravel convention: "s3" for object storage,
  // anything else (default "local") for local disk.
  return env.FILESYSTEM_DISK === "s3"
    ? new S3StorageDriver()
    : new LocalStorageDriver();
}

export function getStorageDriver(): StorageDriver {
  if (!driver) {
    driver = createDriver();
  }
  return driver;
}

function validateUpload(file: File) {
  if (file.size <= 0) {
    throw new Error("EMPTY_FILE");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }
}

export async function saveEmployeeDocumentFile(
  employeeDocumentId: string,
  file: File
): Promise<SavedDocumentFile> {
  validateUpload(file);

  const archiveName = buildArchiveName(file.name);
  const key = `${EMPLOYEE_DOCUMENT_COLLECTION}/${employeeDocumentId}/${archiveName}`;
  await getStorageDriver().save(key, file);

  return {
    originalName: file.name || archiveName,
    archiveName,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storagePath: key,
  };
}

export async function readEmployeeDocumentFile(
  storageKey: string
): Promise<ReadableObject> {
  return getStorageDriver().read(storageKey);
}

// ── Foto Profil Akun ─────────────────────────────────────────────────────────

function validatePhotoUpload(file: File) {
  if (file.size <= 0) throw new Error("EMPTY_FILE");
  if (file.size > MAX_PHOTO_SIZE) throw new Error("FILE_TOO_LARGE");
  if (!PHOTO_MIME_TYPES.has(file.type))
    throw new Error("UNSUPPORTED_FILE_TYPE");
}

/**
 * Simpan foto ke koleksi tertentu (user-photos) di bawah
 * folder pemilik. Mengmengembalikan storage key (disimpan di DB).
 */
export async function savePhoto(
  collection: string,
  ownerId: string,
  file: File
): Promise<{ storagePath: string; mimeType: string; size: number }> {
  validatePhotoUpload(file);
  const archiveName = buildArchiveName(file.name || "photo");
  const key = `${collection}/${ownerId}/${archiveName}`;
  await getStorageDriver().save(key, file);
  return {
    storagePath: key,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function readPhoto(storageKey: string): Promise<ReadableObject> {
  return getStorageDriver().read(storageKey);
}

/** Hapus objek foto. Best-effort; tidak melempar bila sudah tidak ada. */
export async function deletePhoto(storageKey: string): Promise<void> {
  try {
    await getStorageDriver().delete(storageKey);
  } catch {
    /* abaikan: objek mungkin sudah terhapus */
  }
}

/**
 * Soft-delete a stored attachment: move it under the `.trash/` prefix instead
 * of removing it, preserving the original sub-path so it can be restored or
 * purged later. Best-effort; never throws if the source is already gone.
 * Returns the new (trash) storage key.
 */
export async function trashEmployeeDocumentFile(
  storageKey: string
): Promise<string> {
  // Avoid double-trashing if the key is already under the trash prefix.
  if (storageKey.startsWith(`${TRASH_PREFIX}/`)) return storageKey;
  const trashKey = `${TRASH_PREFIX}/${storageKey}`;
  await getStorageDriver().move(storageKey, trashKey);
  return trashKey;
}

/**
 * Restore a soft-deleted attachment: move it back from `.trash/<key>` to its
 * original key. Best-effort; never throws if the source is already gone.
 */
export async function restoreEmployeeDocumentFile(
  storageKey: string
): Promise<void> {
  const trashKey = storageKey.startsWith(`${TRASH_PREFIX}/`)
    ? storageKey
    : `${TRASH_PREFIX}/${storageKey}`;
  const originalKey = trashKey.slice(`${TRASH_PREFIX}/`.length);
  await getStorageDriver().move(trashKey, originalKey);
}

/**
 * Permanently remove a trashed attachment object from `.trash/<key>`.
 * Best-effort; never throws if it is already gone.
 */
export async function purgeEmployeeDocumentFile(
  storageKey: string
): Promise<void> {
  const trashKey = storageKey.startsWith(`${TRASH_PREFIX}/`)
    ? storageKey
    : `${TRASH_PREFIX}/${storageKey}`;
  await getStorageDriver().delete(trashKey);
}
