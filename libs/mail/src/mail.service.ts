import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(to: string, pin: string) {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject: 'Password Reset PIN - Mediitrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">Mediitrack Password Reset</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Please use the following 6-digit PIN to complete the process:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3498db; border-radius: 5px; margin: 20px 0;">
            ${pin}
          </div>
          <p>This PIN will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email or contact support.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">&copy; 2026 Mediitrack. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Successfully sent Reset PIN email to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error);
      throw error;
    }
  }

  async sendPasswordResetSuccessEmail(to: string) {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to,
      subject: 'Password Changed Successfully - Mediitrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">🛡️ Password Updated</h2>
          <p>Hello,</p>
          <p>This is a confirmation that the password for your Mediitrack account <strong>${to}</strong> has been successfully changed.</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #27ae60; font-weight: bold; border-radius: 5px; margin: 20px 0;">
            If you made this change, you don't need to take any further action.
          </div>
          <p><strong>If you did NOT change your password:</strong> Please contact our support team immediately or reset it again to secure your account.</p>
          <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">&copy; 2026 Mediitrack. All rights reserved.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Successfully sent Password Reset Success email to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error sending confirmation email to ${to}`, error);
    }
  }
}
