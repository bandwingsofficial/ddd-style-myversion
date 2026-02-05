import { z } from "zod";

export const createOutletSchema = z.object({
  name: z.string().min(2),
  branch: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 characters"),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusKm: z.number().positive(),
  cameraEnabled: z.boolean(),
  isCentral: z.boolean(),
});

export const updateOutletSchema = z.object({
  name: z.string().min(2),
  branch: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  pincode: z.string().min(6, "Pincode is required"),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusKm: z.number().positive(),
});