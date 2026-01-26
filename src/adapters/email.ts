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
      subject: "Il tuo QR code per 15 Palle",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Ciao ${firstName},</h2>
          <p>Benvenuto al club di biliardo 15 Palle!</p>
          <p>Di seguito trovi il tuo QR code personale. Ti servira per accedere alla struttura.</p>
          
          <div style="margin: 20px 0;">
            <img src="cid:${cid}" alt="Il tuo QR code" style="width: 200px; height: 200px; border: 1px solid #ccc;" />
          </div>

          <p>Se non riesci a visualizzare l'immagine, contatta il supporto.</p>
          <p>Grazie,<br>Il team di 15 Palle</p>
        </div>
      `,
      text: `Ciao ${firstName} ${lastName}, trovi in allegato il tuo QR code personale.`,
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
            subject: "Il tuo codice di verifica - 15 Palle",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Ciao ${firstName},</h2>
                    <p>Hai richiesto un codice di verifica per accedere al tuo account.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; letter-spacing: 5px; text-align: center; margin: 20px 0; font-weight: bold;">
                        ${verificationCode}
                    </div>
                    <p>Il codice scade tra 15 minuti.</p>
                    <p>Se non hai richiesto questo codice, ignora questa email.</p>
                    <p>Grazie,<br>Il team di 15 Palle</p>
                </div>
            `,
            text: `Ciao ${firstName}, il tuo codice di verifica e': ${verificationCode}. Scade tra 15 minuti.`
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