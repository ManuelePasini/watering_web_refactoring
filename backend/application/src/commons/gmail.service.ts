import { google } from "googleapis";

interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}

interface RawEmailOptions {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
}

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

function getGmailClient() {
    return google.gmail({
        version: "v1",
        auth: oauth2Client,
    });
}

function createRawEmail({
    to,
    from,
    subject,
    text,
    html,
}: RawEmailOptions): string {
    const boundary = `boundary_${Date.now()}`;

    const messageParts: string[] = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        text ?? "",
    ];

    if (html) {
        messageParts.push(
            "",
            `--${boundary}`,
            'Content-Type: text/html; charset="UTF-8"',
            "",
            html
        );
    }

    messageParts.push("", `--${boundary}--`);

    const rawMessage = messageParts.join("\n");

    return Buffer.from(rawMessage, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function sendEmail({
    to,
    subject,
    text,
    html,
}: EmailOptions): Promise<string | undefined> {
    const gmail = getGmailClient();

    const raw = createRawEmail({
        to: Array.isArray(to) ? to.join(", ") : to,
        from: process.env.GMAIL_USER ?? "",
        subject,
        text,
        html,
    });

    try {
        const res = await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw },
        });
        return res.data.id;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export async function verifyGmailConnection(): Promise<boolean> {
    try {
        const gmail = getGmailClient();
        await gmail.users.getProfile({
            userId: "me",
        });

        console.log("Gmail API connection OK");
        return true;
    } catch (error) {
        console.error("Gmail connection failed:", error);
        return false;
    }
}