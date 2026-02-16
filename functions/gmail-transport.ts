type EmailInput = {
  to: string;
  subject: string;
  text: string;
};

type TransportResult = {
  provider: "gmail-api" | "smtp-fallback" | "none";
  delivered: boolean;
  details: string;
};

type NodeMailerModule = {
  default: {
    createTransport: (config: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => {
      sendMail: (input: {
        from: string;
        to: string;
        subject: string;
        text: string;
      }) => Promise<unknown>;
    };
  };
};

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getConfiguredProvider() {
  const gmailToken = process.env.GMAIL_OAUTH_ACCESS_TOKEN;
  const gmailSender = process.env.GMAIL_SENDER_EMAIL;

  if (gmailToken && gmailSender) {
    return {
      provider: "gmail-api" as const,
      gmailToken,
      gmailSender
    };
  }

  const smtpConfigured =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USERNAME) &&
    Boolean(process.env.SMTP_PASSWORD) &&
    Boolean(process.env.SMTP_FROM_EMAIL);

  if (smtpConfigured) {
    return {
      provider: "smtp-fallback" as const
    };
  }

  return {
    provider: "none" as const
  };
}

async function sendWithGmailApi(input: EmailInput, token: string, sender: string) {
  const rfc822 = [
    `From: ${sender}`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "Content-Type: text/plain; charset=\"UTF-8\"",
    "",
    input.text
  ].join("\r\n");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      raw: toBase64Url(rfc822)
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail API send failed (${response.status}): ${details}`);
  }
}

async function sendWithSmtp(input: EmailInput): Promise<TransportResult> {
  try {
    const nodemailer = (await import("nodemailer")) as NodeMailerModule;

    const host = process.env.SMTP_HOST as string;
    const port = Number(process.env.SMTP_PORT);
    const username = process.env.SMTP_USERNAME as string;
    const password = process.env.SMTP_PASSWORD as string;
    const from = process.env.SMTP_FROM_EMAIL as string;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const transporter = nodemailer.default.createTransport({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password
      }
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text
    });

    return {
      provider: "smtp-fallback",
      delivered: true,
      details: "Delivered via SMTP fallback"
    };
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown SMTP transport error";

    return {
      provider: "smtp-fallback",
      delivered: false,
      details: `SMTP fallback send failed: ${details}`
    };
  }
}

export async function sendEmergencyNotification(input: EmailInput): Promise<TransportResult> {
  const configured = getConfiguredProvider();

  if (configured.provider === "gmail-api") {
    await sendWithGmailApi(input, configured.gmailToken, configured.gmailSender);
    return {
      provider: "gmail-api",
      delivered: true,
      details: "Delivered via Gmail API"
    };
  }

  if (configured.provider === "smtp-fallback") {
    return sendWithSmtp(input);
  }

  return {
    provider: "none",
    delivered: false,
    details: "No email provider configured. Set Gmail API credentials or SMTP fallback environment values."
  };
}
