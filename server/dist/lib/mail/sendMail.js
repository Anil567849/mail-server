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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const net_1 = __importDefault(require("net"));
const dns_1 = __importDefault(require("dns"));
const readline_1 = __importDefault(require("readline"));
const utils_1 = require("./utils");
/*
// we can use npm smtp - server
export const netServer = net.createServer((socket) => {
    console.log('Client connected');

    socket.write('220 anil.com SMTP server ready\r\n');

    let state = 'INIT';
    let sender = '';
    let recipient = '';

    socket.on('data', (data) => {
        const command = data.toString().trim();
        console.log('Received:', command);

        switch (state) {
            case 'INIT':
                if (command.startsWith('EHLO') || command.startsWith('HELO')) {
                    socket.write('250 Hello\r\n');
                    state = 'MAIL';
                } else {
                    socket.write('502 Command not implemented\r\n');
                }
                break;

            case 'MAIL':
                if (command.startsWith('MAIL FROM:')) {
                    sender = command.substring(10).replace('<', '').replace('>', '');
                    socket.write('250 OK\r\n');
                    state = 'RCPT';
                } else {
                    socket.write('502 Command not implemented\r\n');
                }
                break;

            case 'RCPT':
                if (command.startsWith('RCPT TO:')) {
                    recipient = command.substring(8).replace('<', '').replace('>', '');
                    socket.write('250 OK\r\n');
                    state = 'DATA';
                } else {
                    socket.write('502 Command not implemented\r\n');
                }
                break;

            case 'DATA':
                if (command === 'DATA') {
                    socket.write('354 Start mail input; end with <CRLF>.<CRLF>\r\n');
                    state = 'CONTENT';
                } else {
                    socket.write('502 Command not implemented\r\n');
                }
                break;

            case 'CONTENT':
                if (command.startsWith('CONTENT:')) {
                    const regex = /subject:(.*?),\s*body:(.*?)}$/;
                    const matches = command.match(regex);

                    if (matches) {
                        const subject = matches[1].trim();
                        const body = matches[2].trim();

                        console.log('Subject:', subject);
                        console.log('Body:', body);
                        sendEmail(sender, recipient, subject, body);
                        socket.write('250 OK\r\n');
                        state = 'MAIL';
                    } else {
                        console.error('Failed to parse content');
                    }
                }
                break;
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

const port = 2525;  // Using 2525 as it doesn't require root privileges
netServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Test Client
export function startTestClient(sender: string, recipient: string, subject: string, body: string) {
    const client = new net.Socket();
    client.connect(2525, 'localhost', () => {
        console.log('Connected to server');

        const commands = [
            `EHLO ${sender}`,
            `MAIL FROM:<${sender}>`,
            `RCPT TO:<${recipient}>`,
            'DATA',
            `CONTENT:${{ subject, body }}`,
            'QUIT',
        ];

        let currentCommand = 0;

        client.on('data', async (data) => {
            console.log('Server:', data.toString().trim());
            if (currentCommand < commands.length) {
                await sleep(3000); // Waits for 3 seconds
                client.write(commands[currentCommand] + '\r\n');
                console.log('Client:', commands[currentCommand]);
                currentCommand++;
            } else {
                client.end();
            }
        });
    });

    client.on('close', () => {
        console.log('Connection closed');
    });
}
*/
function sendEmail(sender, recipient, subject, body) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const domain = recipient.split('@')[1]; // a@anil.com = anil.com
            dns_1.default.resolveMx(domain, (err, addresses) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    console.error('Error resolving MX records:', err);
                    reject(`Error resolving MX records: ${err}`);
                    return;
                }
                // const TARGET_SERVER = addresses[0].exchange; // eg: mail.anil.com
                const TARGET_SERVER = 'localhost'; // Testing
                // For DKIM Sign
                // let content = ""
                // try {
                //     content = await buildEmailContentForDKIM(sender, recipient, subject, body);
                // } catch (dkimError) {
                //     console.error('Error signing email with DKIM:', dkimError);
                //     reject(`Error signing email with DKIM: ${dkimError}`);
                //     return;
                // }
                let content = (0, utils_1.buildEmailContent)(sender, recipient, subject, body);
                const client = new net_1.default.Socket();
                const TARGET_SMTP_PORT = 25;
                client.connect(TARGET_SMTP_PORT, TARGET_SERVER, () => {
                    // client.connect(465, 'mail.gmail.com', () => {
                    console.log('Connected to target server');
                    const rl = readline_1.default.createInterface({
                        input: client,
                        // output: client
                        output: process.stdout, // Print server responses to console
                    });
                    const commands = [
                        `EHLO ${sender}`, // The client greets the server and introduces itself.
                        `MAIL FROM:<${sender}>`, // The MAIL FROM command initiates a mail transfer
                        `RCPT TO:<${recipient}>`, // The RCPT TO command specifies the recipient
                        'DATA', // With the DATA command, the client asks the server for permission to transfer the mail data.
                        content,
                        '.', // terminates the mail data transfer
                        'QUIT' // The QUIT command send the request to terminate the SMTP session
                    ];
                    let currentCommand = 0;
                    rl.on('line', (line) => {
                        console.log('Received:', line);
                        if (line.startsWith('2') || line.startsWith('3')) { // Ok messages
                            if (currentCommand < commands.length) {
                                client.write(commands[currentCommand] + '\r\n');
                                currentCommand++;
                            }
                            else {
                                client.end();
                                resolve(true);
                            }
                        }
                        else {
                            client.end();
                            reject(line);
                        }
                    });
                });
                // Handle server responses
                client.on('data', (data) => {
                    console.log('Server response:', data.toString());
                });
                // Handle errors
                client.on('error', (err) => {
                    reject(err.message);
                });
                // Handle connection closure
                client.on('close', () => {
                    console.log('SMTP connection closed');
                });
            }));
        });
    });
}
