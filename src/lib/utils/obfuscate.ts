/**
 * Obfuscates phone numbers for privacy in logs
 * Examples:
 *   +15551234567 -> +1555***4567
 *   15551234567 -> 1555***4567
 *   5551234567 -> 555***4567
 */
export function obfuscatePhone(phone: string | undefined): string {
  if (!phone) return 'unknown';

  // If phone is too short to obfuscate meaningfully, just show last 4
  if (phone.length <= 4) return '***' + phone;

  // Show first 4-5 chars and last 4 chars, hide middle
  const visibleStart = Math.min(4, phone.length - 4);
  const visibleEnd = 4;

  const start = phone.slice(0, visibleStart);
  const end = phone.slice(-visibleEnd);

  return `${start}***${end}`;
}
