import UserProfile from '../../models/UserProfile.js';
import Transaction from '../../models/Transaction.js';

/**
 * Detects Sleeper Account pattern (Account dormant for a long time, suddenly active with high volume)
 */
export const detectSleeperPattern = async (accountId, amount) => {
  const profile = await UserProfile.findOne({ accountId });
  if (!profile) {
    return { detected: false, confidence: 0, explanation: "" };
  }

  // Find last transaction before today
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const lastTx = await Transaction.findOne({ senderId: accountId, createdAt: { $lt: oneDayAgo } }).sort({ createdAt: -1 });

  if (lastTx) {
    const timeSinceLastTx = Date.now() - lastTx.createdAt.getTime();
    const daysDormant = timeSinceLastTx / (1000 * 60 * 60 * 24);

    // If completely dormant for over 90 days and suddenly doing a big transaction
    if (daysDormant > 90 && amount > 5000) {
      return {
        detected: true,
        confidence: 0.85,
        explanation: `Sleeper account suddenly active: Dormant for ${Math.round(daysDormant)} days, high transfer volume.`
      };
    }
  }

  return { detected: false, confidence: 0, explanation: "" };
};
