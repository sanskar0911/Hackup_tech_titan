import express from "express";
import { startSimulation, stopSimulation, switchMode } from "../services/liveSimulationService.js";

const router = express.Router();

router.post("/start", (req, res) => {
  startSimulation();
  res.json({ message: "🚀 Simulation started successfully" });
});

router.post("/stop", (req, res) => {
  stopSimulation();
  res.json({ message: "🛑 Simulation stopped" });
});

router.post("/mode", (req, res) => {
  const { mode } = req.body;
  if (!["normal", "attack"].includes(mode)) {
    return res.status(400).json({ error: "Invalid mode. Use 'normal' or 'attack'." });
  }
  const newMode = switchMode(mode);
  res.json({ message: `🔄 Simulation mode switched to ${newMode}` });
});

export default router;