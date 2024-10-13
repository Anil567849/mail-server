"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstEmail = getFirstEmail;
function getFirstEmail(emails) {
    let to = "";
    if (Array.isArray(emails)) {
        to = emails[0].text || "";
    }
    else if (emails && typeof emails === 'object') {
        to = emails.text || "";
    }
    else {
        to = String(emails || "");
    }
    return to;
}
