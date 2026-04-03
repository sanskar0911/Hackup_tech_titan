import { kafka } from "./kafkaClient.js";
import { processTransactionDirect } from "./consumer.js";

const producer = kafka.producer();

let isKafkaConnected = false;

// ✅ START PRODUCER
export const startProducer = async () => {
  try {
    await producer.connect();
    isKafkaConnected = true;
    console.log("✅ Kafka Producer Connected");
  } catch (error) {
    console.error("❌ Kafka Producer Failed to Connect. Using DIRECT FALLBACK PIPELINE.");
    isKafkaConnected = false;
  }
};

// ✅ SEND TRANSACTION
export const produceTransaction = async (transaction) => {
  if (!isKafkaConnected) {
    // 🔥 Fallback pipeline
    return processTransactionDirect(transaction);
  }

  try {
    await producer.send({
      topic: "transactions",
      messages: [{ value: JSON.stringify(transaction) }],
    });
    // console.log("📤 Transaction sent:", transaction.transactionId);
  } catch (error) {
    console.error("❌ Produce error, trying fallback:", error);
    processTransactionDirect(transaction);
  }
};