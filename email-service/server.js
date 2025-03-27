const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "saichakragunda2002@gmail.com", pass: "Zasdsfijaodafd" },
});

app.post("/send-email", async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email fields" });
    }

    await transporter.sendMail({
      from: "saichakragunda2002@gmail.com",
      to: recipient,
      subject,
      text: message,
    });
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message,
    });
  }
});

app.listen(4000, () => console.log("Email Service running on port 4000"));
