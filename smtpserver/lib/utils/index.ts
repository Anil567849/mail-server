import { AddressObject } from "mailparser";

export function getFirstEmail(emails: AddressObject | AddressObject[] | undefined){
    let to = "";
    if (Array.isArray(emails)) {
        to = emails[0].text || "";
      } else if (emails && typeof emails === 'object') {
        to = emails.text || "";
      } else {
        to = String(emails || "");
      }
      return to;
}