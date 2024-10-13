import {SMTPServer} from 'smtp-server';
import {ParsedMail, simpleParser} from "mailparser";
import { PrismaClient } from '@prisma/client'
import { kafka } from './kafka/client';
import { EachBatchPayload } from 'kafkajs';
import { getFirstEmail } from './lib/utils';

interface EmailData {
    from: string;
    to: string;
    subject: string;
    body: string;
}

const prisma = new PrismaClient()

const server = new SMTPServer({
    allowInsecureAuth: true, // no auth required
    authOptional: true, // no auth required
    onConnect(session, callback) {
        // console.log('on connect', session.id);
        callback(); // accepted
        // return callback(new Error("No connections from localhost allowed")); // If you return an error object, the connection is rejected
    },

    onMailFrom(address, session, callback) {
        // const mailFrom = address.address;
        // console.log('mail from', mailFrom, session.id);
        callback(); // accepted
        // callback(new Error("we can't accept your mail")); // reject
    },

    onRcptTo(address, session, callback) {
        // const mailReceiver = address.address;
        // console.log('mail to', mailReceiver, session.id);
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
            console.log("To::", to,);
            console.log("From::", from);
            console.log("Sub::", subject);
            console.log("Body::", body);
            
            // if(to && from && subject && body){
            //     kafkaProduce(to, from, subject, body);              
            // }
        } catch (err) {
            console.error("Error parsing email:", err)
        } finally {
            callback();
        }
    }
});

// async function kafkaProduce(to: string, from: string, subject: string, body: string){
//     const producer = kafka.producer();
//     await producer.connect();

//     await producer.send({
//         topic: "emails",
//         messages: [
//           {
//             key: "email",
//             value: JSON.stringify({
//                 from,
//                 to,
//                 subject,
//                 body,
//             }),
//           },
//         ],
//     });

// }

// async function saveToDB(emailsData: {from: string, to: string, subject: string, body: string}[]){
//     await prisma.email.createMany({ data: emailsData })
//     console.log('saved to database');
// }

// async function kafkaConsumer() {
//     const consumer = kafka.consumer({ groupId: "email-group" });
//     await consumer.connect();
//     await consumer.subscribe({ topics: ["emails"], fromBeginning: true });

//     await consumer.run({
//         eachBatch: async ({ batch, heartbeat, resolveOffset, commitOffsetsIfNecessary }: EachBatchPayload) => {
//             const messages = batch.messages;
//             console.log(`Recv. ${messages.length} messages..`)

//             let emailsData: EmailData[] = [];

//             for (let message of messages) {
//                 if (!message.value) continue;
//                 const stringMessage = message.value.toString()
//                 const data = JSON.parse(stringMessage);
//                 emailsData.push({
//                     from: data.from,
//                     to: data.to,
//                     subject: data.subject,
//                     body: data.body,
//                 });
//                 resolveOffset(message.offset); // Mark offsets only after save
//                 await commitOffsetsIfNecessary(); // Commit offsets
//                 await heartbeat(); // Prevent rebalancing during long processing
//             }

//             try {
//                 await saveToDB(emailsData); // Save entire batch to DB
//             } catch (error) {
//                 console.error("Failed to save batch to DB:", error);
//             }
//         },
//     });
// }

// kafkaConsumer();

server.listen(25, () => console.log("smtp server connected"));