import UserProfile from '../../models/UserProfile.js';

/**
 * Detects behavioral drift in a single transaction that radically diverges from profile.
 */
export const detectDriftPattern = async (accountId, amount) => {
  const profile = await UserProfile.findOne({ accountId });
  if (!profile) return { detected: false, confidence: 0, explanation: "" };

  if (profile.transaction_frequency > 10) {
    // Standard deviation is usually tracked, but using simple multiple for now
    if (amount > (profile.avg_transaction_amount * 5)) {
      return {
        detected: true,
        confidence: 0.75,
        explanation: `Extreme transaction amount drift (5x historical average of $${Math.round(profile.avg_transaction_amount)})`
      };
    }
  }
  return { detected: false, confidence: 0, explanation: "" };
};
