import * as z from "zod";

/**
 * Creates a reusable Zod schema for address fields.
 * @param t The translation function (e.g., from next-intl).
 * @returns A Zod object shape for address validation.
 */
export const createMetadataSchema = (t: (key: string) => string) =>
  z.object({
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    user_id: z.string().optional(),
    enterprise_id: z.string().optional(),
  });

export const metadataSchema = {
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
  enterprise_id: z.string().optional(),
};
// You can also export the inferred type if needed elsewhere
export type MetadataSchemaValues = z.infer<ReturnType<typeof createMetadataSchema>>;
