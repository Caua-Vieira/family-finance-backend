import { PasswordResetEmailData } from "../../../../domain/contracts/mail-service";

export function buildPasswordResetEmailHtml(data: PasswordResetEmailData): string {
    return `
        <div style="background-color:#f4f5f7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background-color:#0f766e;padding:24px 32px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;">Family Finance</h1>
                </div>
                <div style="padding:32px;color:#1f2937;">
                    <p style="font-size:16px;margin:0 0 16px;">Olá, ${data.name}!</p>
                    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha:</p>
                    <div style="text-align:center;margin-bottom:24px;">
                        <a href="${data.resetUrl}" style="display:inline-block;background-color:#0f766e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 24px;border-radius:8px;">Redefinir senha</a>
                    </div>
                    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0 0 8px;">O link vale por ${data.expiresInMinutes} minutos e só pode ser usado uma vez.</p>
                    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="word-break:break-all;color:#0f766e;">${data.resetUrl}</span></p>
                </div>
                <div style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="font-size:12px;color:#9ca3af;margin:0;">Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.</p>
                </div>
            </div>
        </div>
    `;
}
