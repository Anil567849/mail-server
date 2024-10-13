"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEmailContent = buildEmailContent;
exports.sleep = sleep;
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
