import { readFile, mkdir, writeFile, unlink, rename } from "node:fs/promises";
import path from "node:path";
import { type ReadableObject, type StorageDriver } from "./driver";

// Root penyimpanan lokal. Default ./storage relatif ke working directory.
// Di server (systemd/pm2) working directory bisa berbeda — set STORAGE_LOCAL_ROOT
// ke path absolut agar upload tidak gagal/tersimpan di tempat salah.
const DEFAULT_STORAGE_DIR = process.env.STORAGE_LOCAL_ROOT?.trim()
  ? path.resolve(process.env.STORAGE_LOCAL_ROOT.trim())
  : path.join(process.cwd(), "storage");

export class LocalStorageDriver implements StorageDriver {
  private readonly root: string;

  constructor(root = DEFAULT_STORAGE_DIR) {
    this.root = root;
  }

  private resolve(key: string) {
    return path.join(this.root, key);
  }

  async save(key: string, file: File): Promise<void> {
    const fullPath = this.resolve(key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
  }

  async read(key: string): Promise<ReadableObject> {
    const file = await readFile(this.resolve(key));
    return { body: new Uint8Array(file), contentLength: file.byteLength };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.resolve(key));
    } catch (error) {
      // Sudah tidak ada → anggap sukses (idempotent).
      if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") throw error;
    }
  }

  async move(fromKey: string, toKey: string): Promise<void> {
    const dest = this.resolve(toKey);
    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await rename(this.resolve(fromKey), dest);
    } catch (error) {
      // Sumber sudah tidak ada → anggap sukses (idempotent).
      if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") throw error;
    }
  }
}
