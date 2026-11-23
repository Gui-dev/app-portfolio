import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: false,
});

type SendEmailInput = {
	to: string;
	subject: string;
	html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
	await transporter.sendMail({
		from: env.SMTP_FROM,
		to,
		subject,
		html,
	});
}
