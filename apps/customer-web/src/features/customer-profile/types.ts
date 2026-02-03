// src/features/customer-profile/types.ts

export interface ProfileData {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob?: string; // ISO Date string
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: ProfileData | null; // Data is null if profile doesn't exist yet
}

// Payload for the Upsert endpoint
export interface UpsertProfilePayload {
  fullName: string;
  email?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dob?: string;
  avatarUrl?: string;
}