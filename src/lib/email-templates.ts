type EmailTemplateInput = {
	name: string;
	url: string;
};

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderEmail({
	name,
	url,
	heading,
	message,
	ctaLabel,
}: EmailTemplateInput & { heading: string; message: string; ctaLabel: string }): {
	subject: string;
	html: string;
} {
	const safeName = escapeHtml(name);
	const safeUrl = escapeHtml(url);
	return {
		subject: "",
		html: `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
      <tr>
        <td>
          <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">FolioCraft</p>
          <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">${heading}</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">Olá, ${safeName}.</p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">${message}</p>
          <p style="margin:0 0 24px;">
            <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${ctaLabel}</a>
          </p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#6b7280;">Se você não solicitou esta ação, pode ignorar este e-mail.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
	};
}

export function verificationEmailHtml({ name, url }: EmailTemplateInput): {
	subject: string;
	html: string;
} {
	const email = renderEmail({
		name,
		url,
		heading: "Confirme seu e-mail",
		message:
			"Para concluir seu cadastro no FolioCraft, confirme seu endereço de e-mail clicando no botão abaixo.",
		ctaLabel: "Confirmar meu email",
	});
	return { ...email, subject: "Confirme seu email — FolioCraft" };
}

export function resetPasswordEmailHtml({ name, url }: EmailTemplateInput): {
	subject: string;
	html: string;
} {
	const email = renderEmail({
		name,
		url,
		heading: "Redefina sua senha",
		message:
			"Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha.",
		ctaLabel: "Redefinir minha senha",
	});
	return { ...email, subject: "Redefina sua senha — FolioCraft" };
}
