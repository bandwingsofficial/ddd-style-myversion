// apps/backoffice-web/src/features/super-admin/types.ts
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  title: z.string().min(2, "Professional title is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  notes: z.string().max(500, "Notes are too long").optional(),
  // We don't validate the 'avatar' file strictly in Zod for simplicity here, 
  // but we store the string URL for the UI
  avatarUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema> & {
  avatar?: File; // For the actual upload
};

export interface ProfileData {
  id: string;
  superAdminId: string;
  fullName: string;
  avatarUrl: string | null;
  title: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}