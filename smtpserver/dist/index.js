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
const client_2 = require("./kafka/client");
const utils_1 = require("./lib/utils");
const prisma = new client_1.PrismaClient();
const server = new smtp_server_1.SMTPServer({
    allowInsecureAuth: true, // no auth required
    authOptional: true, // no auth required
    onConnect(session, callback) {
        // console.log('on connect', session.id);
        return callback(); // accepted
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
                if (to && from && subject && body) {
                    kafkaProduce(to, from, subject, body);
                }
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
function kafkaProduce(to, from, subject, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = client_2.kafka.producer();
        yield producer.connect();
        yield producer.send({
            topic: "emails",
            messages: [
                {
                    key: "email",
                    value: JSON.stringify({
                        from,
                        to,
                        subject,
                        body,
                    }),
                },
            ],
        });
    });
}
function saveToDB(emailsData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.email.createMany({ data: emailsData });
        console.log('saved to database');
    });
}
function kafkaConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = client_2.kafka.consumer({ groupId: "email-group" });
        yield consumer.connect();
        yield consumer.subscribe({ topics: ["emails"], fromBeginning: true });
        yield consumer.run({
            eachBatchAutoResolve: false,
            eachBatch: (_a) => __awaiter(this, [_a], void 0, function* ({ batch, heartbeat, resolveOffset, commitOffsetsIfNecessary }) {
                const messages = batch.messages;
                console.log(`Recv. ${messages.length} messages..`);
                let emailsData = [];
                for (let message of messages) {
                    if (!message.value)
                        continue;
                    const stringMessage = message.value.toString();
                    const data = JSON.parse(stringMessage);
                    emailsData.push({
                        from: data.from,
                        to: data.to,
                        subject: data.subject,
                        body: data.body,
                    });
                    resolveOffset(message.offset); // Mark offsets only after save
                    yield commitOffsetsIfNecessary(); // Commit offsets
                    yield heartbeat(); // Prevent rebalancing during long processing
                }
                try {
                    yield saveToDB(emailsData); // Save entire batch to DB
                }
                catch (error) {
                    console.error("Failed to save batch to DB:", error);
                }
            }),
            // autoCommitIntervalMs: null,
            // maxWaitTimeInMs: 30000,
            // minBytes: 1024 * 100,
            // maxBytes: 5242880,
            // autoCommit: false,
        });
    });
}
kafkaConsumer();
server.listen(25, () => console.log("smtp server connected"));
