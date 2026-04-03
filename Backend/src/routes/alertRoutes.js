import express from "express";
import {
  getAlerts,
  createAlert,
  updateAlertStatus,
  simulateUserResponse,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);
router.post("/", createAlert);
router.put("/status", updateAlertStatus);
router.post("/respond", simulateUserResponse);

export default router;