const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLEINT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

function sendMail(obj) {
  console.log(obj);
  try {
    const accessToken = oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "hostelmits123@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLEINT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "🏚️MITS HOSTEL🏚️<hostelmits123@gmail.com>",
      to: `${obj.emailId}`,
      subject: "Message from Mits Hostel Management",
      text : `${obj.text}`,
      html : `${obj.html}`
    };

    const result = transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

module.exports = sendMail;
