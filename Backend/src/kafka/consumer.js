import { kafka } from "./kafkaClient.js";
import decisionEngine from "../services/decisionEngine.js";
import { getIO } from "../socket/socket.js";
import Alert from "../models/Alert.js";
import Transaction from "../models/Transaction.js";
import InvestigationCase from "../models/InvestigationCase.js";

const txConsumer = kafka.consumer({ groupId: "transaction-group" });
const alertConsumer = kafka.consumer({ groupId: "alert-group" });
const producer = kafka.producer();

// In production, we'd query DB. For demo speed, memory cache:
let transactionCache = [];

export const processAlertDirect = async ({ tx, result }) => {
  try {
    // Save Alert in DB
    const alert = await Alert.create({
      transactionId: tx.transactionId,
      accountId: tx.senderId,
      fraudScore: result.fraudScore,
      riskLevel: result.riskLevel,
      reasons: result.reasons,
      status: result.status === "BLOCKED" ? "FRAUD" : "PENDING",
      risk_breakdown: result.factors || [],
      decision_result: {
        status: result.status,
        decisionId: result.decisionId
      }
    });

    console.log("🚨 FRAUD ALERT GENERATED:", alert.transactionId);
    
    // Auto-create case if BLOCKED and HIGH risk
    if (result.status === "BLOCKED" || result.riskLevel === "HIGH") {
      const caseId = `CASE-AUTO-${Date.now()}`;
      await InvestigationCase.create({
        caseId,
        title: `Auto-investigation for Tx ${tx.transactionId}`,
        alertId: alert._id,
        transactionId: tx.transactionId,
        status: "OPEN",
        resolution: "PENDING"
      });
      console.log("📁 AUTO-CASE CREATED:", caseId);
    }

    // Push alert via websocket
    const io = getIO();
    if(io) io.emit("new-alert", alert);
  } catch (err) {
    console.error("❌ alertConsumer Error:", err);
  }
};

export const processTransactionDirect = async (tx) => {
  try {
    // Keep cache bounded
    if (transactionCache.length > 5000) transactionCache.shift();
    transactionCache.push(tx);

    const mappedTx = {
      transactionId: tx.transactionId,
      sourceAccountId: tx.senderId,
      targetAccountId: tx.receiverId,
      amount: tx.amount,
      deviceId: tx.deviceId,
      location: tx.location,
      channel: tx.channel
    };
    
    // Evaluate Pre-Transaction via Decision Engine
    const decisionResult = await decisionEngine.evaluatePreTransaction(mappedTx);
    
    // Convert status to transaction status map
    let finalStatus = "COMPLETED";
    if (decisionResult.status === "BLOCK") finalStatus = "BLOCKED";
    else if (decisionResult.status === "REQUIRE_MFA") finalStatus = "PENDING";

    const reasons = decisionResult.factors.map(f => f.reason);

    // Legacy support for socket payload formatting
    const legacyResult = {
      fraudScore: decisionResult.score,
      riskLevel: decisionResult.level,
      reasons: reasons,
      status: finalStatus,
      factors: decisionResult.factors,
      decisionId: decisionResult.decisionId
    };

    // Save transaction to DB
    await Transaction.create({ 
       ...tx, 
       fraudScore: decisionResult.score,
       riskLevel: decisionResult.level,
       reason: decisionResult.reason,
       status: finalStatus,
       decisionId: decisionResult.decisionId
    });

    // Forward to frontend via socket
    const io = getIO();
    if (io) io.emit("new-transaction", { tx, result: legacyResult });

    if (decisionResult.level === "HIGH" || decisionResult.level === "MEDIUM") {
      processAlertDirect({ tx, result: legacyResult });
    }
  } catch (err) {
    console.error("❌ txConsumer Error:", err);
  }
};

export const startConsumer = async () => {
  try {
    await txConsumer.connect();
    await alertConsumer.connect();
    await producer.connect();

    console.log("✅ Kafka Consumers Connected");

    await txConsumer.subscribe({ topic: "transactions", fromBeginning: true });
    await alertConsumer.subscribe({ topic: "fraud-alerts", fromBeginning: true });

    // Stream 1: Process Transactions
    txConsumer.run({
      eachMessage: async ({ message }) => {
        const tx = JSON.parse(message.value.toString());
        await processTransactionDirect(tx);
        
        // Note: the original Kafka flow sent alerts to a second topic
        // We will maintain that for the Kafka pipeline here:
        /*
        const result = await analyzeTransaction(tx, transactionCache);
        if (result.riskLevel === "HIGH" || result.riskLevel === "MEDIUM") {
          await producer.send({
            topic: "fraud-alerts",
            messages: [{ value: JSON.stringify({ tx, result }) }]
          });
        }
        */
      }
    });

    // Stream 2: Process High/Medium Risk Alerts
    // We only process if it came from the alert queue
    alertConsumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value.toString());
        // Since we combined the logic, we won't strictly need this unless it originated from Kafka's alert queue
        // But for completeness we handle it
        await processAlertDirect(payload);
      }
    });
  } catch (error) {
    console.error("❌ Kafka Consumer Failed to Connect:", error.message);
  }
};