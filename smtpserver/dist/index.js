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
const server = new smtp_server_1.SMTPServer({
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
    onData(stream, session, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedData = yield (0, mailparser_1.simpleParser)(stream);
                console.log("Email received!");
                console.log("Subject:", parsedData.subject);
                console.log("Body:", parsedData.text);
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
server.listen(25, () => console.log("smtp server connected"));
