import GraphEdge from '../models/GraphEdge.js';
import { detectCircularPattern } from './patterns/circular.js';
import { detectFanOutPattern } from './patterns/fanout.js';
import { detectSmurfingPattern } from './patterns/smurfing.js';
import { detectSleeperPattern } from './patterns/sleeper.js';
import { detectCrossBankPattern } from './patterns/crossBank.js';
import { detectDriftPattern } from './patterns/drift.js';

class GraphFraudDetector {
  /**
   * Evaluates if a transaction introduces significant graph-based risk
   * (e.g. cycle creation, fan-out matching, complex layering, sleeper)
   */
  async evaluateGraphRisk(sourceId, targetId, amount, transactionId, sourceBankId, targetBankId) {
    let riskScore = 0;
    const reasons = [];

    // 1. Check for Circular Transactions
    const cycleRisk = await detectCircularPattern(sourceId, targetId);
    if (cycleRisk.detected) {
      riskScore += 40 * cycleRisk.confidence;
      reasons.push(cycleRisk.explanation);
    }

    // 2. Check for Rapid Fan-Out
    const fanOutRisk = await detectFanOutPattern(sourceId);
    if (fanOutRisk.detected) {
      riskScore += 30 * fanOutRisk.confidence;
      reasons.push(fanOutRisk.explanation);
    }
    
    // 3. Check for Smurfing / Layering
    const smurfingRisk = await detectSmurfingPattern(sourceId, targetId, amount);
    if (smurfingRisk.detected) {
      riskScore += 35 * smurfingRisk.confidence;
      reasons.push(smurfingRisk.explanation);
    }

    // 4. Check for Sleeper Account
    const sleeperRisk = await detectSleeperPattern(sourceId, amount);
    if (sleeperRisk.detected) {
      riskScore += 20 * sleeperRisk.confidence;
      reasons.push(sleeperRisk.explanation);
    }

    // 5. Check for Cross-Bank Risk
    if (sourceBankId && targetBankId) {
       const crossBankRisk = await detectCrossBankPattern(sourceBankId, targetBankId);
       if (crossBankRisk.detected) {
         riskScore += 15 * crossBankRisk.confidence;
         reasons.push(crossBankRisk.explanation);
       }
    }

    // 6. Check for Behavioral Drift
    const driftRisk = await detectDriftPattern(sourceId, amount);
    if (driftRisk.detected) {
      riskScore += 10 * driftRisk.confidence;
      reasons.push(driftRisk.explanation);
    }

    return {
      type: "network",
      contribution: riskScore,
      reason: reasons.join(" | ") || "No abnormal network flows detected"
    };
  }

  /**
   * Add edge to graph after approval
   */
  async addEdge(sourceId, targetId, amount, transactionId, bankId) {
    const edge = new GraphEdge({
      sourceAccountId: sourceId,
      targetAccountId: targetId,
      amount,
      transactionId,
      bank_id: bankId || 'DEFAULT_BANK'
    });
    await edge.save();
    return edge;
  }

  /**
   * Fetch N-degree graph around an account for visualization
   */
  async getAccountGraph(accountId, maxHops = 2) {
    const nodes = new Map();
    const edges = [];
    
    let currentHop = 0;
    let accountsToExplore = [accountId];
    const visitedEdges = new Set();
    
    while(currentHop < maxHops && accountsToExplore.length > 0) {
      const nextHopAccounts = new Set();
      
      const outgoingEdges = await GraphEdge.find({ sourceAccountId: { $in: accountsToExplore } });
      const incomingEdges = await GraphEdge.find({ targetAccountId: { $in: accountsToExplore } });
      
      const allFound = [...outgoingEdges, ...incomingEdges];
      for(const e of allFound) {
        if (!visitedEdges.has(e._id.toString())) {
           visitedEdges.add(e._id.toString());
           edges.push({
             id: e._id.toString(),
             source: e.sourceAccountId,
             target: e.targetAccountId,
             amount: e.amount,
             timestamp: e.timestamp,
             transactionId: e.transactionId
           });
           nextHopAccounts.add(e.sourceAccountId);
           nextHopAccounts.add(e.targetAccountId);
           
           nodes.set(e.sourceAccountId, { id: e.sourceAccountId });
           nodes.set(e.targetAccountId, { id: e.targetAccountId });
        }
      }
      accountsToExplore = Array.from(nextHopAccounts);
      currentHop++;
    }
    
    return {
      nodes: Array.from(nodes.values()),
      edges
    };
  }
}

export default new GraphFraudDetector();
