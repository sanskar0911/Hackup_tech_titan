import GraphEdge from '../../models/GraphEdge.js';

/**
 * Detects Rapid Fan-Out (one to many in short timespan)
 */
export const detectFanOutPattern = async (accountId) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentEdges = await GraphEdge.find({ sourceAccountId: accountId, timestamp: { $gte: oneHourAgo } });
  
  const uniqueTargets = new Set(recentEdges.map(e => e.targetAccountId));
  
  if (uniqueTargets.size > 10) {
    return { 
      detected: true, 
      confidence: 0.9, 
      explanation: `Rapid fan-out detected: ${uniqueTargets.size} unique recipients in 1 hour` 
    };
  }
  return { detected: false, confidence: 0, explanation: "" };
};
