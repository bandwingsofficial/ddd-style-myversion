import { z } from "zod";

export const createOutletSchema = z.object({
  name: z.string().min(2),
  branch: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusKm: z.number().positive(),
  cameraEnabled: z.boolean(),
  isCentral: z.boolean(),
});

export const updateOutletSchema = z.object({
  name: z.string().min(2),
  branch: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  deliveryRadiusKm: z.number().positive(),
});
