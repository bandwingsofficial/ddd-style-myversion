import { OutletUserFormErrors } from '../types/outlet-user.types';

export const formInputClassName = (hasError = false) =>
  `h-12 w-full rounded-xl border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-4 ${
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
      : 'border-input focus:border-primary focus:ring-primary/10'
  }`;

export function validateUserName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  return undefined;
}

export function validateUserEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function validateUserPhone(value: string, required = false): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return required ? 'Phone is required.' : undefined;
  if (!/^[0-9+\-\s()]{7,20}$/.test(trimmed)) {
    return 'Enter a valid phone number.';
  }
  return undefined;
}

export function validateUserPassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  return undefined;
}

export function validateUserRole(value: string): string | undefined {
  if (!value) return 'Role is required.';
  return undefined;
}

export function validateOutletId(value: string): string | undefined {
  if (!value.trim()) return 'Outlet assignment is required.';
  return undefined;
}

export function validateCreateForm(values: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  outletId: string;
}): OutletUserFormErrors {
  return Object.fromEntries(
    Object.entries({
      name: validateUserName(values.name),
      email: validateUserEmail(values.email),
      phone: validateUserPhone(values.phone),
      role: validateUserRole(values.role),
      password: validateUserPassword(values.password),
      outletId: validateOutletId(values.outletId),
    }).filter(([, error]) => Boolean(error)),
  );
}

export function validateEditForm(values: {
  name: string;
  phone: string;
  role: string;
  outletId: string;
}): OutletUserFormErrors {
  return Object.fromEntries(
    Object.entries({
      name: validateUserName(values.name),
      phone: validateUserPhone(values.phone),
      role: validateUserRole(values.role),
      outletId: validateOutletId(values.outletId),
    }).filter(([, error]) => Boolean(error)),
  );
}
