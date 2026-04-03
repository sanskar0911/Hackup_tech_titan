import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["system", "analyst"],
    required: true,
  },

  accountId: {
    type: String,
    required: true,
  },

  riskScore: {
    type: Number,
    required: true,
  },

  reasons: [
    {
      type: String,
    },
  ],

  status: {
    type: String,
    enum: ["Sent", "User Responded", "Under Review", "Closed"],
    default: "Sent",
  },

  userResponse: {
    type: String,
    default: "",
  },

  mfaRequired: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);