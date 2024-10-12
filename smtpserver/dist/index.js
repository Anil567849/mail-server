"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const smtp_server_1 = require("smtp-server");
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
        stream.on("data", (data) => {
            console.log('mail data', data.toString(), session.id);
        });
        stream.on("end", callback); // accepted
    }
});
server.listen(25, () => console.log("smtp server connected"));
