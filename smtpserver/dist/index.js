"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const smtp_server_1 = require("smtp-server");
const mailparser_1 = require("mailparser");
const client_1 = require("@prisma/client");
const utils_1 = require("./lib/utils");
const prisma = new client_1.PrismaClient();
const server = new smtp_server_1.SMTPServer({
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
    onData(stream, session, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const parsedData = yield (0, mailparser_1.simpleParser)(stream);
                const to = (0, utils_1.getFirstEmail)(parsedData.to);
                const from = (_a = parsedData.from) === null || _a === void 0 ? void 0 : _a.text;
                const subject = parsedData.subject;
                const body = parsedData.text;
                console.log("To::", to);
                console.log("From::", from);
                console.log("Sub::", subject);
                console.log("Body::", body);
                // if(to && from && subject && body){
                //     kafkaProduce(to, from, subject, body);              
                // }
            }
            catch (err) {
                console.error("Error parsing email:", err);
            }
            finally {
                callback();
            }
        });
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
