/**
 * Obfuscates phone numbers for privacy in logs
 * Shows only last 4 digits
 * Examples:
 *   +15551234567 -> ********4567
 *   15551234567 -> *******4567
 *   5551234567 -> ******4567
 */
export function obfuscatePhone(phone: string | undefined): string {
  if (!phone) return 'unknown';

  // If phone is too short to obfuscate meaningfully, just show last 4
  if (phone.length <= 4) return '***' + phone;

  // Show only last 4 digits, mask everything else
  const lastFour = phone.slice(-4);
  const maskLength = phone.length - 4;
  const mask = '*'.repeat(maskLength);

  return `${mask}${lastFour}`;
}
