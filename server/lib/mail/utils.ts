
import fs from 'fs';
import path from 'path';
import { DKIMSign } from 'dkim-signer';

export function buildEmailContent(sender: string, recipient: string, subject: string, body: string) {
    const date = new Date().toUTCString(); // Get current date in RFC 5322 format
  
    // Construct email headers and body
    const emailContent = [
      `From: ${sender}`,            // From header
      `To: ${recipient}`,            // To header
      `Date: ${date}`,               // Date header
      `Subject: ${subject}`,         // Subject header
      '',                            // Blank line between headers and body
      body,                          // Email body
      ''                             // Ending blank line (just for neatness)
    ].join('\r\n'); // Join all parts with CRLF (as per SMTP protocol)
  
    return emailContent;
}

export async function buildEmailContentForDKIM(sender: string, recipient: string, subject: string, body: string) {

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
  return await signEmailWithDKIM(content)
}

export async function signEmailWithDKIM(email: string): Promise<string> {
  const pathOfDKIM_Private_key = path.join(__dirname, 'dkim-private.pem')
  const privateKey = fs.readFileSync(pathOfDKIM_Private_key, 'utf8');
  const options = {
      privateKey,
      keySelector: 'default', // 'your_selector'
      domainName: 'localhost', // 'yourdomain.com'
  };

  return DKIMSign(email, options);
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}