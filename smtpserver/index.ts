import {SMTPServer} from 'smtp-server';
import {AddressObject, ParsedMail, simpleParser} from "mailparser";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const server = new SMTPServer({
    allowInsecureAuth: true, // no auth required
    authOptional: true, // no auth required
    onConnect(session, callback) {
        console.log('on connect', session.id);
        return callback(); // accepted
        // return callback(new Error("No connections from localhost allowed")); // If you return an error object, the connection is rejected
    },

    onMailFrom(address, session, callback) {
        const mailFrom = address.address;
        console.log('mail from', mailFrom, session.id);
        callback(); // accepted
        // callback(new Error("we can't accept your mail")); // reject
    },

    onRcptTo(address, session, callback) {
        const mailReceiver = address.address;
        console.log('mail to', mailReceiver, session.id);
        callback(); // accepted
        // callback(new Error("we don't have user with this mail")); // reject
    },

    async onData(stream, session, callback){
        try {
            const parsedData: ParsedMail = await simpleParser(stream);
            const to = getFirstEmail(parsedData.to);
            const from = parsedData.from?.text;
            const subject = parsedData.subject;
            const body = parsedData.text;

            if(to && from && subject && body){
                await saveToDB(to, from, subject, body);
                console.log('saved to db');                
            }

        } catch (err) {
            console.error("Error parsing email:", err)
        } finally {
            callback();
        }
    }
});

function getFirstEmail(emails: AddressObject | AddressObject[] | undefined){
    let to = "";
    if (Array.isArray(emails)) {
        to = emails[0].text || "";
      } else if (emails && typeof emails === 'object') {
        to = emails.text || "";
      } else {
        to = String(emails || "");
      }
      return to;
}

async function saveToDB(to: string, from: string, subject: string, body: string){
    await prisma.email.create({
        data: {
            from,
            to,
            subject,
            body,
        }
    })
}

server.listen(25, () => console.log("smtp server connected"));