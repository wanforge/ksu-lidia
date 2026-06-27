import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { type ReadableObject, type StorageDriver } from "./driver";
import { env } from "@/config/env";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`MISSING_STORAGE_ENV: ${name}`);
  }
  return value;
}

/**
 * S3-compatible object storage driver, configured with the standard AWS_* env
 * convention (same names Laravel uses). Works with AWS S3 and any compatible
 * provider (rustfs, MinIO, idCloudHost, Cloudflare R2, etc.) by setting
 * AWS_ENDPOINT and AWS_USE_PATH_STYLE_ENDPOINT.
 */
export class S3StorageDriver implements StorageDriver {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = requireEnv("AWS_BUCKET", env.AWS_BUCKET);

    this.client = new S3Client({
      region: env.AWS_DEFAULT_REGION ?? env.AWS_REGION ?? "us-east-1",
      endpoint: env.AWS_ENDPOINT || undefined,
      forcePathStyle: env.AWS_USE_PATH_STYLE_ENDPOINT,
      credentials: {
        accessKeyId: requireEnv("AWS_ACCESS_KEY_ID", env.AWS_ACCESS_KEY_ID),
        secretAccessKey: requireEnv(
          "AWS_SECRET_ACCESS_KEY",
          env.AWS_SECRET_ACCESS_KEY
        ),
      },
    });
  }

  async save(key: string, file: File): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
        ContentLength: file.size,
      })
    );
  }

  async read(key: string): Promise<ReadableObject> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new Error("STORAGE_OBJECT_NOT_FOUND");
    }

    return {
      body: (
        response.Body as {
          transformToWebStream: () => ReadableStream<Uint8Array>;
        }
      ).transformToWebStream(),
      contentLength: response.ContentLength,
    };
  }

  async delete(key: string): Promise<void> {
    // S3 DeleteObject is idempotent — succeeds even if the key is absent.
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  async move(fromKey: string, toKey: string): Promise<void> {
    // S3 has no native move: copy then delete the source.
    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${fromKey}`,
          Key: toKey,
        })
      );
    } catch (error) {
      // Source already gone → nothing to move.
      const name = (error as { name?: string })?.name;
      if (name === "NoSuchKey" || name === "NotFound") return;
      throw error;
    }
    await this.delete(fromKey);
  }
}
