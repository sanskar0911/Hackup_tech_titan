import { predictFraud } from "./aiModel.js";

// ================= GRAPH STATE =================
// In a real app this would be in a DB or Redis, but we keep it in-memory for the demo.
const graph = {
  nodes: {},
  adjacencyList: {},
};

function initNode(id) {
  return {
    id,
    totalSent: 0,
    totalReceived: 0,
    inDegree: 0,
    outDegree: 0,
    lastActive: null,
    transactions: [],
    avgAmount: 0,
  };
}

// ================= UPDATE GRAPH =================
function updateGraph(tx) {
  const { senderId, receiverId, amount } = tx;

  if (!graph.nodes[senderId]) graph.nodes[senderId] = initNode(senderId);
  if (!graph.nodes[receiverId]) graph.nodes[receiverId] = initNode(receiverId);

  const sender = graph.nodes[senderId];
  const receiver = graph.nodes[receiverId];

  sender.totalSent += amount;
  sender.outDegree++;
  sender.transactions.push(tx);
  sender.avgAmount = sender.totalSent / sender.outDegree;

  receiver.totalReceived += amount;
  receiver.inDegree++;
  receiver.transactions.push(tx);

  if (!graph.adjacencyList[senderId]) {
    graph.adjacencyList[senderId] = [];
  }

  graph.adjacencyList[senderId].push(receiverId);
}

// ================= CYCLE DETECTION =================
function hasCycle(start, target, visited = new Set(), depth = 0) {
  if (depth > 4) return false;
  if (!graph.adjacencyList[start]) return false;

  for (let neighbor of graph.adjacencyList[start]) {
    if (neighbor === target && depth >= 1) return true;

    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      if (hasCycle(neighbor, target, visited, depth + 1)) return true;
    }
  }
  return false;
}

// ================= MAIN ENGINE =================
export const analyzeTransaction = async (tx, allTransactions = []) => {
  const now = Date.now();
  const txTime = tx.timestamp ? new Date(tx.timestamp).getTime() : now;

  updateGraph(tx);

  let reasons = [];
  let ruleScore = 0;
  let behaviorScore = 0;
  let graphScore = 0;
  let anomalyScore = 0;

  const node = graph.nodes[tx.senderId];

  // ================= RULE ENGINE =================
  if (tx.amount > 100000) {
    ruleScore += 30;
    reasons.push("High-value transaction");
  }

  const recentTx = allTransactions.filter(
    (t) => t.senderId === tx.senderId && now - new Date(t.timestamp).getTime() < 5 * 60 * 1000
  );

  if (recentTx.length > 3) {
    ruleScore += 25;
    reasons.push("Rapid transactions burst");
  }

  // ================= GRAPH ENGINE =================
  if (hasCycle(tx.receiverId, tx.senderId)) {
    graphScore += 40;
    reasons.push("Circular fund movement detected");
  }

  const layering = allTransactions.some(
    (t1) =>
      t1.senderId === tx.senderId &&
      allTransactions.some(
        (t2) =>
          t2.senderId === t1.receiverId &&
          t2.receiverId !== tx.senderId &&
          now - new Date(t2.timestamp).getTime() < 10 * 60 * 1000
      )
  );

  if (layering) {
    graphScore += 25;
    reasons.push("Layering pattern detected");
  }

  const receivers = new Set(recentTx.map((t) => t.receiverId));
  if (receivers.size >= 5) {
    graphScore += 35;
    reasons.push("Rapid fan-out burst");
  }

  // ================= BEHAVIOR =================
  const smallTx = recentTx.filter((t) => t.amount < 10000);
  if (smallTx.length >= 5) {
    behaviorScore += 35;
    reasons.push("Smurfing pattern detected");
  }

  if (node.lastActive && txTime - new Date(node.lastActive).getTime() > 60 * 60 * 1000) {
    behaviorScore += 30;
    reasons.push("Sleeper account activated");
  }

  node.lastActive = tx.timestamp || new Date();

  if (node.avgAmount > 0 && tx.amount > node.avgAmount * 4) {
    anomalyScore += 30;
    reasons.push("Adversarial behavior drift detected");
  }

  // ================= HYBRID SCORING =================
  let ruleBasedScore = 0.3 * ruleScore + 0.25 * behaviorScore + 0.25 * graphScore + 0.2 * anomalyScore;

  // ================= AI MODEL =================
  // Generate predictive AI score based on transaction heuristics
  const mlScore = await predictFraud([
    tx.amount || 0,
    recentTx.length || 1,
    node.outDegree || 1,
    0, // placeholder for cross-bank
    node.avgAmount === 0 ? 1 : 0,
  ]);

  // Combine Rule and ML Score
  let finalScore = Math.round(0.6 * ruleBasedScore + 0.4 * mlScore * 100);

  // Time decay
  const decay = Math.exp(-(now - txTime) / (5 * 60 * 1000));
  finalScore *= decay;
  finalScore = Math.min(Math.round(finalScore), 100);

  // Determine Risk Level & Alert
  let riskLevel = "LOW";
  let status = "PENDING";
  
  if (finalScore > 80) {
    riskLevel = "HIGH";
    status = "BLOCKED";
    reasons.push("Transaction blocked due to critical risk");
  } else if (finalScore > 50) {
    riskLevel = "MEDIUM";
    status = "PENDING"; // Wait for review
  } else {
    riskLevel = "LOW";
    status = "COMPLETED";
  }

  return {
    fraudScore: finalScore,
    aiScore: Math.round(mlScore * 100),
    riskLevel,
    status,
    reasons,
  };
};