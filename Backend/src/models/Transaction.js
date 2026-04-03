import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED", "BLOCKED"], default: "PENDING" },
    fraudScore: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
    reason: { type: String, default: "" },
    bank_id: { type: String, default: "DEFAULT_BANK" },
    decisionId: { type: mongoose.Schema.Types.ObjectId, ref: 'DecisionLog' }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
