import { z } from "zod";

import { Constants } from "@/lib/database.types";

import { VehicleStatus } from "./common.type";
import { PaymentCycle } from "./common.type";

export const VehicleOwnershipStatus = Constants.public.Enums.vehicle_ownership_status;
export type VehicleOwnershipStatusProps = (typeof VehicleOwnershipStatus)[number];

export const VehicleSchema = {
  name: z.string({ message: "Trucks.form.name.required" }).min(1, "Trucks.form.name.required"),
  make: z.string({ message: "Vehicles.form.make.required" }).min(1, "Vehicles.form.make.required"),
  model: z
    .string({ message: "Vehicles.form.model.required" })
    .min(1, "Vehicles.form.model.required"),
  year: z.number({
    invalid_type_error: "Forms.must_be_number",
    message: "Forms.must_be_number",
  }),
  vin: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Za-z0-9]+$/.test(val), {
      message: "Vehicles.form.vin.invalid",
    })
    .refine((val) => !val || val.length === 17, {
      message: "Vehicles.form.vin.exact_length",
    })
    .nullable(),

  ownership_status: z
    .enum(VehicleOwnershipStatus, {
      message: "Vehicles.form.ownership_status.required",
    })
    .default("owned"),

  monthly_payment: z.string({ message: "Forms.must_be_number" }).optional().nullable(),
  daily_payment: z.string({ message: "Forms.must_be_number" }).optional().nullable(),
  weekly_payment: z.string({ message: "Forms.must_be_number" }).optional().nullable(),
  annual_payment: z.string({ message: "Forms.must_be_number" }).optional().nullable(),
  payment_cycle: z.enum(PaymentCycle).default("monthly"),
  status: z.enum(VehicleStatus).optional(),
  notes: z.any().optional().nullable(),
};
