import Alert from "../models/Alert.js";


// =====================================================
// ✅ GET ALL ALERTS
// =====================================================
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};


// =====================================================
// ✅ CREATE ALERT (SYSTEM / ANALYST)
// =====================================================
export const createAlert = async (req, res) => {
  try {
    const { accountId, riskScore, reasons, type, mfaRequired } = req.body;

    const alert = new Alert({
      accountId,
      riskScore,
      reasons,
      type: type || "system",
      mfaRequired: mfaRequired || false,
      status: "Sent",
    });

    await alert.save();

    res.status(201).json(alert);
  } catch (error) {
    console.error("Create Alert Error:", error);
    res.status(500).json({ message: "Failed to create alert" });
  }
};


// =====================================================
// ✅ UPDATE ALERT STATUS
// =====================================================
export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId, status } = req.body;

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.status = status || alert.status;

    await alert.save();

    res.json(alert);
  } catch (error) {
    console.error("Update Alert Error:", error);
    res.status(500).json({ message: "Failed to update alert" });
  }
};


// =====================================================
// ✅ SIMULATE USER RESPONSE
// =====================================================
export const simulateUserResponse = async (req, res) => {
  try {
    const { alertId, response } = req.body;

    const alert = await Alert.findById(alertId);

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.userResponse = response || "This was not me!";
    alert.status = "User Responded";

    await alert.save();

    res.json(alert);

  } catch (error) {
    console.error("User Response Error:", error);
    res.status(500).json({ message: "Failed to simulate response" });
  }
};