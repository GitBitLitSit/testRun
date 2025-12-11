import QRCode from "qrcode";
import * as nodemailer from "nodemailer";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "eu-west-1" });

export const sendQrCodeEmail = async (
  sourceMail: string,
  firstName: string,
  lastName: string,
  email: string,
  qrUuid: string
) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrUuid);

    const transporter = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
      newline: 'windows'
    });

    const cid = qrUuid;

    const info = await transporter.sendMail({
      from: sourceMail,
      to: email,
      subject: "Your QR Code for Billiard Club",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello ${firstName},</h2>
          <p>Welcome to the 15Palle Billiard Club!</p>
          <p>Please find your personal access QR code below. You will need this to enter the facility.</p>
          
          <div style="margin: 20px 0;">
            <img src="cid:${cid}" alt="Your QR Code" style="width: 200px; height: 200px; border: 1px solid #ccc;" />
          </div>

          <p>If you cannot see the image, please contact support.</p>
          <p>Best regards,<br>The Billiard Club Team</p>
        </div>
      `,
      text: `Hello ${firstName} ${lastName}, pelase find your QR code attached.`,
      attachments: [
        {
          filename: "qrcode.png",
          path: qrCodeDataUrl,
          cid: cid
        },
      ],
    });

    const command = new SendRawEmailCommand({
      Source: sourceMail,
      Destinations: [email],
      RawMessage: {
        Data: info.message as unknown as Uint8Array
      }
    });

    const result = await ses.send(command);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (
    sourceMail: string,
    email: string,
    verificationCode: string,
    firstName: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            streamTransport: true,
            buffer: true,
            newline: 'windows'
        });

        const info = await transporter.sendMail({
            from: sourceMail,
            to: email,
            subject: "Your Verification Code - Billiard Club",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Hello ${firstName},</h2>
                    <p>You requested a verification code to access your account.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; letter-spacing: 5px; text-align: center; margin: 20px 0; font-weight: bold;">
                        ${verificationCode}
                    </div>
                    <p>This code expires in 15 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>Best regards,<br>The Billiard Club Team</p>
                </div>
            `,
            text: `Hello ${firstName}, your verification code is: ${verificationCode}. It expires in 15 minutes.`
        });

        const command = new SendRawEmailCommand({
            Source: sourceMail,
            Destinations: [email],
            RawMessage: {
                Data: info.message as unknown as Uint8Array
            }
        });

        const result = await ses.send(command);
        return { success: true, data: result };

    } catch (error) {
        console.error("Failed to send verification email:", error);
        return { success: false, error };
    }
};