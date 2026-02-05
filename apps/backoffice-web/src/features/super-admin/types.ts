// apps/backoffice-web/src/features/super-admin/types.ts
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  avatarUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  title: z.string().min(2, "Professional title is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  notes: z.string().max(500, "Notes are too long").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface ProfileData extends ProfileFormValues {
  id: string;
  superAdminId: string;
  createdAt: string;
  updatedAt: string;
}