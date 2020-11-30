import nodemailer from "nodemailer";
import Email from "email-templates";
import path from "path";

// Make these env variables

export const sendEmailWithTemplate = async (
  email: string,
  locals: { [key: string]: string },
  template: string
) => {
  const mailOptions = new Email({
    message: { from: "darryl.carter@ethereal.email" },
    transport: {
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "darryl.carter@ethereal.email",
        pass: "MDf1NdsXM1DkuuFaTj",
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    textOnly: false,
    send: true,
    preview: false,
  });

  await mailOptions
    .send({
      template: path.join(__dirname, "..", "emails", template),
      message: { to: email },
      locals: locals,
    })
    .then((info) => {
      console.log(nodemailer.getTestMessageUrl(info));
    })
    .catch(console.error);
  return;
};
