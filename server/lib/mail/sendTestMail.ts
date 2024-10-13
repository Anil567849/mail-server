
import nodemailer from "nodemailer";

export async function sendTestEmail(from: string, to: string, subject: string, body: string) {
    let transporter = nodemailer.createTransport({
      host: "localhost",
      port: 25,
      secure: false, // no SSL
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    let info = await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
    });
  
    console.log("Message sent: %s", info.messageId);
}