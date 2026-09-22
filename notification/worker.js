const { Worker } = require("bullmq");
const nodemailer = require("nodemailer");
const { buildWisdomMatchHtmlEmail } = require("./wisdom-email-html");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: "kartikeya.anjul@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
  "email-queue",
  async (job) => {
    try {
      console.log(`Processing Job ${job.id}`);

      const { email, subject, body } = job.data;

      console.log(job.data);

      const html = buildWisdomMatchHtmlEmail({ subject, body });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        text: body,
        html,
      });

      console.log("MAIL SENT");
      console.log(info);

      return "done";
    } catch (err) {
      console.log("ERROR OCCURRED");
      console.log(err);
    }
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

worker.on("drained", () => {
  console.log("Queue empty");
});