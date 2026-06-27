import { Prisma } from "@prisma/client";

/**
 * Recursively serializes Prisma query results to plain JavaScript objects.
 * Specifically, it converts Prisma Decimal instances to standard JavaScript numbers
 * so they can be safely passed from Server Components to Client Components.
 */
export function serializePrisma<T>(data: T): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date
  if (data instanceof Date) {
    return data;
  }

  // Handle Decimal
  if (Prisma.Decimal.isDecimal(data)) {
    return (data as any).toNumber();
  }

  // Handle Array
  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item));
  }

  // Handle Object
  if (typeof data === "object") {
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializePrisma(value);
    }
    return serialized;
  }

  return data;
}
