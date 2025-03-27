const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/notifications", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const NotificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  channel: { type: String, enum: ["email", "sms"], required: true },
  recipient: String,
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

app.post("/send-notification", async (req, res) => {
  try {
    const { userId, message, channel, recipient } = req.body;

    if (!userId || !message || !channel || !recipient) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const notification = await Notification.create({
      userId,
      message,
      channel,
      recipient,
    });

    let response;
    if (channel === "email") {
      response = await axios.post("http://localhost:4000/send-email", {
        recipient,
        subject: "Notification",
        message,
      });
    } else if (channel === "sms") {
      response = await axios.post("http://localhost:5000/send-sms", {
        recipient,
        message,
      });
    }

    notification.status = response?.data?.success ? "sent" : "failed";
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Notification error",
      error: error.message,
    });
  }
});

app.listen(3000, () => console.log("User Service running on port 3000"));
