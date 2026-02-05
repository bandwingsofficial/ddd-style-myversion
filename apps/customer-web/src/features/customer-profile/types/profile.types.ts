export interface ProfileData {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  code: string;
  message: string;
  data: ProfileData | null;
}

export interface UpsertProfileRequest {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
}