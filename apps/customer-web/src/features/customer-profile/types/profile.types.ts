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

// Changed to support FormData (File upload)
export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  avatar?: File; // The actual file object for the PATCH request
  gender?: string;
  dob?: string;
}