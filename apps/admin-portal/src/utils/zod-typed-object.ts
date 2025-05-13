import { z, ZodRawShape, ZodObject } from "zod";

/**
 * Helper for best-DX autocomplete when defining Zod object schemas.
 * Usage: typedZodObject<{...}>({...})
 */
export function typedZodObject<T extends ZodRawShape>(shape: T): ZodObject<T> {
  return z.object(shape);
}
