import GraphEdge from '../models/GraphEdge.js';

class GraphFraudDetector {
  /**
   * Evaluates if a transaction introduces significant graph-based risk
   * (e.g. cycle creation, fan-out matching, complex layering)
   */
  async evaluateGraphRisk(sourceId, targetId, amount, transactionId) {
    let riskScore = 0;
    const reasons = [];

    // Check for Circular Transactions (Cycle of length up to 4)
    // Concept: source -> target -> A -> B -> source
    const cycleRisk = await this.detectCycle(sourceId, targetId);
    if (cycleRisk.detected) {
      riskScore += 40 * cycleRisk.confidence;
      reasons.push(cycleRisk.explanation);
    }

    // Check for Rapid Fan-Out (source is sending to many unique nodes quickly)
    const fanOutRisk = await this.detectRapidFanOut(sourceId);
    if (fanOutRisk.detected) {
      riskScore += 30 * fanOutRisk.confidence;
      reasons.push(fanOutRisk.explanation);
    }
    
    // Check for Smurfing / Layering (Multiple small txs to same node, or through intermediary)
    const smurfingRisk = await this.detectSmurfing(sourceId, targetId, amount);
    if (smurfingRisk.detected) {
      riskScore += 35 * smurfingRisk.confidence;
      reasons.push(smurfingRisk.explanation);
    }

    return {
      type: "network",
      contribution: riskScore,
      reason: reasons.join(" | ") || "No abnormal network flows detected"
    };
  }

  /**
   * Detects a cycle from target back to source using a simple 3-hop BFS.
   */
  async detectCycle(originalSource, newTarget) {
    // We are about to add edge originalSource -> newTarget.
    // If there is a path from newTarget -> originalSource, we have a cycle.
    
    // Perform BFS up to 3 hops
    let queue = [{ id: newTarget, depth: 0 }];
    const visited = new Set();
    visited.add(newTarget);
    
    while(queue.length > 0) {
      const current = queue.shift();
      if (current.depth >= 3) continue;

      const edges = await GraphEdge.find({ sourceAccountId: current.id });
      for (const edge of edges) {
        if (edge.targetAccountId === originalSource) {
           return { detected: true, confidence: 1.0 - (current.depth * 0.1), explanation: `Circular evasion detected at depth ${current.depth + 1}` };
        }
        if (!visited.has(edge.targetAccountId)) {
           visited.add(edge.targetAccountId);
           queue.push({ id: edge.targetAccountId, depth: current.depth + 1 });
        }
      }
    }
    
    return { detected: false, confidence: 0, explanation: "" };
  }

  /**
   * Detects Rapid Fan-Out (one to many in short timespan)
   */
  async detectRapidFanOut(accountId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEdges = await GraphEdge.find({ sourceAccountId: accountId, timestamp: { $gte: oneHourAgo } });
    
    const uniqueTargets = new Set(recentEdges.map(e => e.targetAccountId));
    
    if (uniqueTargets.size > 10) {
      return { detected: true, confidence: 0.9, explanation: `Rapid fan-out detected: ${uniqueTargets.size} unique recipients in 1 hour` };
    }
    return { detected: false, confidence: 0, explanation: "" };
  }

  /**
   * Detects Smurfing (many small transactions structurally attempting to evade limits)
   */
  async detectSmurfing(sourceId, targetId, amount) {
    const thresholdLimit = 10000;
    // Check if amount is suspiciously close to limit
    if (amount > 8500 && amount < 10000) {
       // Look for previous transactions between these two today
       const today = new Date();
       today.setHours(0,0,0,0);
       const previous = await GraphEdge.find({ sourceAccountId: sourceId, targetAccountId: targetId, timestamp: { $gte: today }});
       
       const total = previous.reduce((acc, edge) => acc + edge.amount, 0);
       if (total + amount >= 10000) {
          return { detected: true, confidence: 0.95, explanation: `Smurfing detected: structuring deposits to bypass $10k limit` };
       }
    }
    return { detected: false, confidence: 0, explanation: "" };
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
