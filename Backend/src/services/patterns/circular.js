import GraphEdge from '../../models/GraphEdge.js';

/**
 * Detects a cycle from target back to source using a simple 3-hop BFS.
 */
export const detectCircularPattern = async (sourceId, targetId) => {
  // We are about to add edge sourceId -> targetId.
  // If there is a path from targetId -> sourceId, we have a cycle.
  
  // Perform BFS up to 3 hops
  let queue = [{ id: targetId, depth: 0 }];
  const visited = new Set();
  visited.add(targetId);
  
  while(queue.length > 0) {
    const current = queue.shift();
    if (current.depth >= 3) continue;

    const edges = await GraphEdge.find({ sourceAccountId: current.id });
    for (const edge of edges) {
      if (edge.targetAccountId === sourceId) {
         return { 
           detected: true, 
           confidence: 1.0 - (current.depth * 0.1), 
           explanation: `Circular evasion detected at depth ${current.depth + 1}` 
         };
      }
      if (!visited.has(edge.targetAccountId)) {
         visited.add(edge.targetAccountId);
         queue.push({ id: edge.targetAccountId, depth: current.depth + 1 });
      }
    }
  }
  
  return { detected: false, confidence: 0, explanation: "" };
};
