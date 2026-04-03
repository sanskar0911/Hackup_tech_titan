import { kafka } from "./kafkaClient.js";

const producer = kafka.producer();

// ✅ START PRODUCER
export const startProducer = async () => {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer Connected");
  } catch (error) {
    console.error("❌ Kafka Producer Failed to Connect:", error);
  }
};

// ✅ SEND TRANSACTION
export const produceTransaction = async (transaction) => {
  try {
    await producer.send({
      topic: "transactions",
      messages: [{ value: JSON.stringify(transaction) }],
    });
    // console.log("📤 Transaction sent:", transaction.transactionId);
  } catch (error) {
    console.error("❌ Produce error:", error);
  }
};