const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);


// 📧 Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});


// 📩 API Route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Save to DB
    const newMessage = new Contact({ name, email, message });
    await newMessage.save();

    // ✅ Send response FIRST (fast)
    res.status(200).json({ msg: "Message sent successfully" });

    // ✅ Send email in background (no await)
    transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
      subject: "New Contact Message",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

  } catch (error) {
    res.status(500).json({ msg: "Error sending message" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));