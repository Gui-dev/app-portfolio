const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:8025";

type MailpitAddress = { Address: string };
type MailpitMessageSummary = {
	ID: string;
	Subject: string;
	To: MailpitAddress[];
};
type MailpitMessagesResponse = { messages: MailpitMessageSummary[] };
type MailpitMessage = { HTML: string };

function decodeHtmlEntities(value: string): string {
	return value
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&amp;", "&");
}

function extractFirstHref(html: string): string {
	const match = html.match(/href="([^"]+)"/);
	if (!match?.[1]) {
		throw new Error("Mailpit message did not contain an href");
	}
	return decodeHtmlEntities(match[1]);
}

export async function waitForEmail({
	to,
	subjectContains,
}: {
	to: string;
	subjectContains: string;
}): Promise<string> {
	const deadline = Date.now() + 10_000;
	while (Date.now() < deadline) {
		const response = await fetch(`${MAILPIT_URL}/api/v1/messages`);
		if (response.ok) {
			const data = (await response.json()) as MailpitMessagesResponse;
			const match = data.messages.find(
				(message) =>
					message.Subject.includes(subjectContains) &&
					message.To.some((recipient) => recipient.Address === to),
			);
			if (match) {
				const messageResponse = await fetch(`${MAILPIT_URL}/api/v1/message/${match.ID}`);
				if (messageResponse.ok) {
					const message = (await messageResponse.json()) as MailpitMessage;
					return extractFirstHref(message.HTML);
				}
			}
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(
		`Timed out waiting for Mailpit email to=${to} subjectContains=${subjectContains}`,
	);
}
