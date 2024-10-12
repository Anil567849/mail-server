import express, { Request, Response } from 'express';
const app = express();
import cors from 'cors';
import { sendTestEmail } from './lib/mail/sendMail';

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000"
}))

app.post("/api/send-mail", async (req: Request, res: Response) => {

    const {from, to, subject, body} = req.body;

    try {
        await sendTestEmail(from, to, subject, body)
        res.status(200).json({data: "mail sent"})
    } catch (error) {
        res.status(500).json({data: `mail not sent ${error}`})
    }

})

app.listen(8000, () => console.log("listening on port", 8000))