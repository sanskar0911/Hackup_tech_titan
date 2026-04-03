import { kafka } from "./kafkaClient.js";
import { analyzeTransaction } from "../services/fraudDetectionService.js";
import { getIO } from "../socket/socket.js";
import Alert from "../models/Alert.js";
import Transaction from "../models/Transaction.js";

const txConsumer = kafka.consumer({ groupId: "transaction-group" });
const alertConsumer = kafka.consumer({ groupId: "alert-group" });
const producer = kafka.producer();

// In production, we'd query DB. For demo speed, memory cache:
let transactionCache = [];

export const startConsumer = async () => {
  await txConsumer.connect();
  await alertConsumer.connect();
  await producer.connect();

  console.log("✅ Kafka Consumers Connected");

  await txConsumer.subscribe({ topic: "transactions", fromBeginning: true });
  await alertConsumer.subscribe({ topic: "fraud-alerts", fromBeginning: true });

  // Stream 1: Process Transactions
  txConsumer.run({
    eachMessage: async ({ message }) => {
      try {
        const tx = JSON.parse(message.value.toString());

        // Keep cache bounded
        if (transactionCache.length > 5000) transactionCache.shift();
        transactionCache.push(tx);

        const result = await analyzeTransaction(tx, transactionCache);
        
        // Save transaction to DB
        await Transaction.create({ ...tx, ...result });

        // Forward to frontend via socket
        const io = getIO();
        io.emit("new-transaction", { tx, result });

        if (result.riskLevel === "HIGH" || result.riskLevel === "MEDIUM") {
          await producer.send({
            topic: "fraud-alerts",
            messages: [{ value: JSON.stringify({ tx, result }) }]
          });
        }
      } catch (err) {
        console.error("❌ txConsumer Error:", err);
      }
    }
  });

  // Stream 2: Process High/Medium Risk Alerts
  alertConsumer.run({
    eachMessage: async ({ message }) => {
      try {
        const { tx, result } = JSON.parse(message.value.toString());

        // Save Alert in DB
        const alert = await Alert.create({
          transactionId: tx.transactionId,
          accountId: tx.senderId,
          fraudScore: result.fraudScore,
          riskLevel: result.riskLevel,
          reasons: result.reasons,
          status: result.status === "BLOCKED" ? "FRAUD" : "PENDING"
        });

        console.log("🚨 FRAUD ALERT GENERATED:", alert.transactionId);
        
        // Push alert via websocket
        const io = getIO();
        io.emit("new-alert", alert);
      } catch (err) {
        console.error("❌ alertConsumer Error:", err);
      }
    }
  });
};