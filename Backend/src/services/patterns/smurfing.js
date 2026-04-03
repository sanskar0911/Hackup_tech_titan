import GraphEdge from '../../models/GraphEdge.js';

/**
 * Detects Smurfing (many small transactions structurally attempting to evade limits)
 */
export const detectSmurfingPattern = async (sourceId, targetId, amount) => {
  const thresholdLimit = 10000;
  // Check if amount is suspiciously close to limit (e.g., between 8.5k and 10k)
  if (amount > 8500 && amount < thresholdLimit) {
     // Look for previous transactions between these two today
     const today = new Date();
     today.setHours(0,0,0,0);
     const previous = await GraphEdge.find({ sourceAccountId: sourceId, targetAccountId: targetId, timestamp: { $gte: today }});
     
     const total = previous.reduce((acc, edge) => acc + edge.amount, 0);
     if (total + amount >= thresholdLimit) {
        return { 
          detected: true, 
          confidence: 0.95, 
          explanation: `Smurfing detected: structuring deposits to bypass $10k limit` 
        };
     }
  }
  return { detected: false, confidence: 0, explanation: "" };
};
