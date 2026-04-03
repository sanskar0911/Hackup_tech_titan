export const chatWithSystem = async (req, res) => {
  const { message, transaction } = req.body;

  let reply = "";

  if (message.includes("why")) {
    reply = `This transaction is flagged due to: ${transaction.reasons.join(", ")}`;
  } else if (message.includes("risk")) {
    reply = `Risk score is ${transaction.riskScore} due to abnormal patterns.`;
  } else {
    reply = "This transaction shows suspicious behavioral patterns.";
  }

  res.json({ reply });
};