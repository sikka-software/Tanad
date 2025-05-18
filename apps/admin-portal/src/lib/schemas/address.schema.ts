import * as z from "zod";

/**
 * Creates a reusable Zod schema for address fields.
 * @param t The translation function (e.g., from next-intl).
 * @returns A Zod object shape for address validation.
 */
export const createAddressSchema = (t: (key: string) => string) =>
  z.object({
    short_address: z.string().optional(),
    building_number: z.string().optional(),
    street_name: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    zip_code: z.string().optional(),
    additional_number: z.string().optional(),
  });

export const addressSchema = {
  short_address: z.string().optional().nullable(),
  building_number: z.string().optional().nullable(),
  street_name: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  additional_number: z.string().optional().nullable(),
};
// You can also export the inferred type if needed elsewhere
export type AddressSchemaValues = z.infer<ReturnType<typeof createAddressSchema>>;
