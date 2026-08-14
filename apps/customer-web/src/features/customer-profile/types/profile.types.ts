export interface ProfileData {
  id: string | null;
  customerId: string;

  fullName?: string | null;
  email?: string | null;
  phone: string | null;
  avatarUrl?: string | null;

  gender?: "MALE" | "FEMALE" | "OTHER" | string | null;
  dob?: string | null;
  referralCode?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
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
  avatar?: File;
  gender?: string;
  dob?: string;
}

/** Primary identity label for profile UI. */
export function getProfileDisplayName(
  profile: ProfileData | null | undefined,
): string {
  const name = profile?.fullName?.trim();

  if (name) return name;

  const phone = profile?.phone?.trim();

  if (phone) return formatProfilePhone(phone);

  return "Customer";
}

/** Light display formatting for E.164 Indian numbers; otherwise returns as-is. */
export function formatProfilePhone(phone: string): string {
  const normalized = phone.trim();

  if (/^\+91\d{10}$/.test(normalized)) {
    const local = normalized.slice(3);

    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }

  return normalized;
}