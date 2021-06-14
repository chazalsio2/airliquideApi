import mailjet from "node-mailjet";

const Mailjet = mailjet.connect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendEmailWithTemplate({
  templateId,
  variables,
  email,
  name,
  ccVision,
  ccCommerciaux,
  subject,
}) {
  const params = {
    From: {
      Email: "noreply@vision-r.re",
      Name: "Vision-R",
    },
    To: [
      {
        Email: email,
        Name: name,
      },
    ],
    CC: [
      { Email: ccVision},
      { Email: ccCommerciaux}
    ],
    TemplateID: templateId,
    TemplateLanguage: true,
    Variables: variables,
    Subject: subject,
  };

  const request = Mailjet.post("send", { version: "v3.1" }).request({
    Messages: [params],
  });

  console.info(`[EMAIL] "${subject}" à ${email}`);

  return request;
}

export async function sendEmail({
  email,
  name,
  subject,
  textPart,
  htmlPart,
  customId,
  copyToAdmin = false,
  files = [],
}) {
  const params = {
    From: {
      Email: "noreply@vision-r.re",
      Name: "Vision-R",
    },
    To: [
      {
        Email: email,
        Name: name || email,
      },
    ],
    Bcc: copyToAdmin
      ? [{ Email: "contact@vision-r.re", Name: "Vision-R" }]
      : [],
    Subject: subject,
    TextPart: textPart,
    HTMLPart: htmlPart,
    CustomID: customId,
  };

  if (files.length) {
    params.InlinedAttachments = files;
  }

  console.info(`[EMAIL] "${subject}" à ${email}`);

  const request = Mailjet.post("send", { version: "v3.1" }).request({
    Messages: [params],
  });

  return request;
}
