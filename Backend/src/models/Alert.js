import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true },
    accountId: { type: String, required: true }, // The account that generated the alert
    fraudScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    reasons: [{ type: String }],
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "FRAUD", "CLOSED"],
      default: "PENDING",
    },
    userResponse: { type: String, default: "" },
    analystNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);