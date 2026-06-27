/**
 * Storage abstraction so document attachments can live on local disk in
 * development and on S3-compatible object storage in production. The active
 * driver is chosen once at startup from `FILESYSTEM_DISK` (Laravel convention:
 * "s3" selects object storage, otherwise local disk).
 *
 * A `key` is the storage-relative path of an object, grouped per module, e.g.
 * `employee-documents/<employeeDocumentId>/<archiveName>`. It is what gets
 * persisted to `DocumentAttachment.storagePath`:
 * - local driver: resolved against the storage root (default `./storage`)
 * - s3 driver: used as the object key within the bucket
 * A deployment uses a single driver, so the key's interpretation is stable.
 */

export type ReadableObject = {
  /** Either an in-memory buffer (local) or a streamed body (s3). */
  body: Uint8Array | ReadableStream<Uint8Array>;
  contentLength?: number;
};

export interface StorageDriver {
  /** Persist an uploaded file at the given storage-relative key. */
  save(key: string, file: File): Promise<void>;

  /** Read a previously stored object by its key. */
  read(key: string): Promise<ReadableObject>;

  /** Remove an object by its key. Must not throw if it is already gone. */
  delete(key: string): Promise<void>;

  /**
   * Move an object from one key to another (used for soft-delete to `.trash`).
   * Must not throw if the source is already gone.
   */
  move(fromKey: string, toKey: string): Promise<void>;
}
