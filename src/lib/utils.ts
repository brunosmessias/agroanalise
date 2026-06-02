import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Builds a wa.me link from a Brazilian phone number, normalizing to digits and
 * prefixing the country code (55) when missing. Returns null if there are not
 * enough digits to form a valid number.
 */
export function whatsappLink(phone: string | null | undefined, text?: string) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (!digits.startsWith("55") || digits.length <= 11) {
    digits = `55${digits}`;
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
