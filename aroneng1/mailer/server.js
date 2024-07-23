const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http = require("http");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const config = require("./config");

const { port, allowedDomains } = config;

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: allowedDomains }));
app.use(helmet());

app.use(compression());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://aron-engineering.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  return res.send("Hello World");
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "career.arongengineering@gmail.com",
    pass: "jxtwzhqfurjkaxdb",
  },
});

app.use(express.json());

app.post("/sendEmail", upload.single("cv"), async (req, res) => {
  try {
    const { user_name, user_email, user_position, user_cover } = req.body;

    const mailOptions = {
      from: "career.arongengineering@gmail.com",
      to: req.body.toEmail,
      subject: req.body.subject,
      text: req.body.text,
      attachments: [
        {
          filename: "CV.pdf",
          content: req.file.buffer,
        },
      ],
      html: `
        <p>Name: ${user_name}</p>
        <p>Email: ${user_email}</p>
        <p>Position: ${user_position}</p>
        <p>Cover Letter: ${user_cover}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Failed to send email.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
