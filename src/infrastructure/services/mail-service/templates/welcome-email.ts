import { WelcomeEmailData } from "../../../../domain/contracts/mail-service";

export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
    const intro = data.isHouseholdCreator
        ? `Sua família <strong>${data.householdName}</strong> foi criada com sucesso.`
        : `Você agora faz parte da família <strong>${data.householdName}</strong>.`;

    const inviteHint = data.isHouseholdCreator
        ? "Compartilhe o código abaixo com quem mais você quiser adicionar à sua família:"
        : "Esse é o código de convite da sua família, caso queira convidar mais alguém:";

    return `
        <div style="background-color:#f4f5f7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background-color:#0f766e;padding:24px 32px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;">Family Finance</h1>
                </div>
                <div style="padding:32px;color:#1f2937;">
                    <p style="font-size:16px;margin:0 0 16px;">Olá, ${data.name}!</p>
                    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">${intro}</p>
                    <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#4b5563;">${inviteHint}</p>
                    <div style="background-color:#f0fdfa;border:1px dashed #0f766e;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
                        <span style="font-size:24px;letter-spacing:4px;font-weight:bold;color:#0f766e;">${data.inviteCode}</span>
                    </div>
                    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0;">Basta informar esse código na tela de cadastro para entrar na mesma família e compartilhar o controle financeiro.</p>
                </div>
                <div style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="font-size:12px;color:#9ca3af;margin:0;">Você recebeu este e-mail porque criou uma conta no Family Finance.</p>
                </div>
            </div>
        </div>
    `;
}
