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
exports.buildEmailContent = buildEmailContent;
exports.buildEmailContentForDKIM = buildEmailContentForDKIM;
exports.signEmailWithDKIM = signEmailWithDKIM;
exports.sleep = sleep;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dkim_signer_1 = require("dkim-signer");
function buildEmailContent(sender, recipient, subject, body) {
    const date = new Date().toUTCString(); // Get current date in RFC 5322 format
    // Construct email headers and body
    const emailContent = [
        `From: ${sender}`, // From header
        `To: ${recipient}`, // To header
        `Date: ${date}`, // Date header
        `Subject: ${subject}`, // Subject header
        '', // Blank line between headers and body
        body, // Email body
        '' // Ending blank line (just for neatness)
    ].join('\r\n'); // Join all parts with CRLF (as per SMTP protocol)
    return emailContent;
}
function buildEmailContentForDKIM(sender, recipient, subject, body) {
    return __awaiter(this, void 0, void 0, function* () {
        // For DKIM Content 
        // Step 1: Generate DKIM Keys
        //     bash cmd:
        //     openssl genrsa -out dkim-private.pem 1024
        //     openssl rsa -in dkim-private.pem -pubout -out dkim-public.pem
        // Step 2: DNS TXT Record Setup
        //     Name: default._domainkey.anil.com
        //     Type: TXT
        //     Value: "v=DKIM1; k=rsa; p=<public_key_content>"
        const headers = [
            `From: ${sender}`,
            `To: ${recipient}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
        ];
        const content = headers.join('\r\n') + '\r\n\r\n' + body;
        return yield signEmailWithDKIM(content);
    });
}
function signEmailWithDKIM(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pathOfDKIM_Private_key = path_1.default.join(__dirname, 'dkim-private.pem');
        const privateKey = fs_1.default.readFileSync(pathOfDKIM_Private_key, 'utf8');
        const options = {
            privateKey,
            keySelector: 'default', // 'your_selector'
            domainName: 'localhost', // 'yourdomain.com'
        };
        return (0, dkim_signer_1.DKIMSign)(email, options);
    });
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
