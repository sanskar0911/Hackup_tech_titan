const { getIO } = require("../socket/socket");
const fraudService = require("./fraudDetectionService");

let mode = "normal";

const generateTransaction = () => {
  const amount = mode === "attack"
    ? Math.random() * 100000
    : Math.random() * 5000;

  return {
    sender: "ACC" + Math.floor(Math.random() * 100),
    receiver: "ACC" + Math.floor(Math.random() * 100),
    amount,
    timestamp: new Date()
  };
};

const startSimulation = () => {
  setInterval(() => {
    const tx = generateTransaction();

    const result = fraudService.analyze(tx);

    getIO().emit("transaction", {
      ...tx,
      risk: result.score,
      reasons: result.reasons
    });

  }, 1000);
};

const switchMode = () => {
  mode = mode === "normal" ? "attack" : "normal";
};

module.exports = { startSimulation, switchMode };