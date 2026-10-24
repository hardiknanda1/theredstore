const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL.test(value.trim());
}

export function cleanText(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
