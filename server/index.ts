import express, { Request, Response } from 'express';
const app = express();
import nodemailer from "nodemailer";
import cors from 'cors';

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000"
}))

app.post("/api/send-mail", async (req: Request, res: Response) => {

    const {from, to, subject, body} = req.body;

    async function sendTestEmail() {
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

    try {
        await sendTestEmail()
        res.status(200).json({data: "mail sent"})
    } catch (error) {
        res.status(500).json({data: `mail not sent ${error}`})
    }

})

app.listen(8000, () => console.log("listening on port", 8000))