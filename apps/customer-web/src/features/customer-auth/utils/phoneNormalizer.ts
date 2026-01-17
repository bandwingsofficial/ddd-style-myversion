export const normalizeIndianPhone = (phone: string): string => {
  if (phone.startsWith("+91")) return phone;
  if (phone.length === 10) return `+91${phone}`;
  return phone;
};
