import {SMTPServer} from 'smtp-server';
import {ParsedMail, simpleParser} from "mailparser";

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
            console.log("Email received!", session.id);
            console.log("Subject:", parsedData.subject);
            console.log("Body:", parsedData.text);
        } catch (err) {
            console.error("Error parsing email:", err)
        } finally {
            callback();
        }
    }
});

server.listen(25, () => console.log("smtp server connected"));