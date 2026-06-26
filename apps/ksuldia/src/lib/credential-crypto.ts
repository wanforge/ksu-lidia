import {
  pbkdf2Sync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";
import type { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const masterKey = (): string =>
  env.CREDENTIAL_ENCRYPTION_KEY ?? "dev-credential-key-change-in-prod";

function deriveKey(userId: string, salt: string): Buffer {
  return pbkdf2Sync(masterKey() + userId, salt, 100_000, 32, "sha256");
}

/** Generate a new random per-user salt (hex). Call on user creation or password change. */
export function generateCredentialSalt(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Encrypt a plaintext string.
 * Returns a dot-separated string: ivHex.authTagHex.ciphertextHex
 */
export function encryptCredential(
  plaintext: string,
  userId: string,
  salt: string
): string {
  const key = deriveKey(userId, salt);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    ciphertext.toString("hex"),
  ].join(".");
}

/**
 * Decrypt a value produced by encryptCredential.
 * Throws if the ciphertext is tampered or the key is wrong.
 */
export function decryptCredential(
  encoded: string,
  userId: string,
  salt: string
): string {
  const parts = encoded.split(".");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = deriveKey(userId, salt);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Re-encrypt all credential fields from oldSalt → newSalt for a given userId.
 * Call inside a Prisma transaction when the user's password changes.
 * Skips rows that cannot be decrypted (instead of losing data).
 */
export async function reEncryptUserCredentials(
  tx: TxClient,
  userId: string,
  oldSalt: string,
  newSalt: string
): Promise<void> {
  const rows: { id: string; passwordEnc: string; notesEnc: string | null }[] =
    await tx.accountCredential.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, passwordEnc: true, notesEnc: true },
    });

  for (const row of rows) {
    const updates: { passwordEnc?: string; notesEnc?: string | null } = {};
    try {
      updates.passwordEnc = encryptCredential(
        decryptCredential(row.passwordEnc, userId, oldSalt),
        userId,
        newSalt
      );
    } catch {
      // leave as-is — better to keep (unreadable) than delete
    }
    if (row.notesEnc) {
      try {
        updates.notesEnc = encryptCredential(
          decryptCredential(row.notesEnc, userId, oldSalt),
          userId,
          newSalt
        );
      } catch {
        // same — skip
      }
    }
    if (Object.keys(updates).length > 0) {
      await tx.accountCredential.update({
        where: { id: row.id },
        data: updates,
      });
    }
  }
}
