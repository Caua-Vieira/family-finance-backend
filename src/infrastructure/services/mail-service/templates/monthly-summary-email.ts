import { MonthlySummaryEmailData } from "../../../../domain/contracts/mail-service";
import { DashboardCategorySummaryDTO } from "../../../../domain/types/dashboard-dto";

const MONTH_NAMES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildVariationLine(variation: number | null, previousMonthLabel: string): string {
    if (variation === null) {
        return `Sem dados de ${previousMonthLabel} para comparar.`;
    }
    if (variation === 0) {
        return `Despesas estáveis em relação a ${previousMonthLabel}.`;
    }

    const isIncrease = variation > 0;
    const color = isIncrease ? "#b91c1c" : "#15803d";
    const arrow = isIncrease ? "&#9650;" : "&#9660;";
    const verb = isIncrease ? "a mais" : "a menos";

    return `<span style="color:${color};font-weight:700;">${arrow} ${Math.abs(variation).toFixed(1)}%</span> em despesas ${verb} do que em ${previousMonthLabel}.`;
}

function buildCategoryRows(categories: DashboardCategorySummaryDTO[]): string {
    const spending = categories
        .filter((category) => category.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    if (spending.length === 0) {
        return `<p style="margin:0;font-size:13px;color:#9ca3af;">Nenhum gasto por categoria registrado neste mês.</p>`;
    }

    const max = spending[0].spent;

    return spending.map((category) => {
        const width = Math.max(6, Math.round((category.spent / max) * 100));

        return `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                    <td style="font-size:13px;color:#374151;padding-bottom:6px;">${category.categoryName}</td>
                    <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;padding-bottom:6px;font-variant-numeric:tabular-nums;">${formatCurrency(category.spent)}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e5ebe9;border-radius:5px;">
                            <tr>
                                <td width="${width}%" style="background-color:#0f766e;height:6px;line-height:6px;font-size:1px;border-radius:5px;">&nbsp;</td>
                                <td style="line-height:6px;font-size:1px;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    }).join("");
}

export function buildMonthlySummaryEmailHtml(data: MonthlySummaryEmailData): string {
    const { summary } = data;
    const monthLabel = `${capitalize(MONTH_NAMES[summary.month - 1])} de ${summary.year}`;
    const previousMonthLabel = MONTH_NAMES[summary.previousMonth.month - 1];

    const isPositive = summary.balance >= 0;
    const balanceColor = isPositive ? "#0f766e" : "#b91c1c";
    const balanceBg = isPositive ? "#ecfdf5" : "#fef2f2";

    return `
        <div style="background-color:#eef2f1;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
                <tr>
                    <td style="background-color:#0f766e;border-radius:16px 16px 0 0;padding:28px 32px;">
                        <p style="margin:0;color:#a7f3d0;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Family Finance</p>
                        <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.3;">Resumo de ${monthLabel}</h1>
                        <p style="margin:4px 0 0;color:#ccfbf1;font-size:13px;">${data.householdName}</p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                        <p style="font-size:15px;color:#1f2937;margin:0 0 24px;">Olá, ${data.name}! Veja como ficaram as finanças da família nesse mês.</p>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${balanceBg};border-radius:12px;margin-bottom:16px;">
                            <tr>
                                <td style="padding:18px 22px;">
                                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${balanceColor};">Saldo do mês</p>
                                    <p style="margin:4px 0 0;font-size:30px;font-weight:700;color:${balanceColor};font-variant-numeric:tabular-nums;">${formatCurrency(summary.balance)}</p>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                            <tr>
                                <td width="48%" style="width:48%;background-color:#f0fdf4;border-radius:10px;padding:14px 16px;">
                                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#16a34a;">Receitas</p>
                                    <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#14532d;font-variant-numeric:tabular-nums;">${formatCurrency(summary.income)}</p>
                                </td>
                                <td width="4%" style="width:4%;font-size:1px;line-height:1px;">&nbsp;</td>
                                <td width="48%" style="width:48%;background-color:#fef2f2;border-radius:10px;padding:14px 16px;">
                                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#dc2626;">Despesas</p>
                                    <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:#7f1d1d;font-variant-numeric:tabular-nums;">${formatCurrency(summary.expenses)}</p>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size:13px;color:#4b5563;margin:0 0 28px;line-height:1.6;">
                            ${buildVariationLine(summary.previousMonth.expensesVariationPercentage, previousMonthLabel)}
                        </p>

                        <p style="font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#1f2937;margin:0 0 16px;">Maiores gastos por categoria</p>
                        ${buildCategoryRows(summary.categories)}
                    </td>
                </tr>
                <tr>
                    <td style="background-color:#f9fafb;border-radius:0 0 16px 16px;padding:18px 32px;border:1px solid #e5e7eb;border-top:none;">
                        <p style="font-size:12px;color:#9ca3af;margin:0;">Você recebeu este e-mail porque faz parte da família ${data.householdName} no Family Finance.</p>
                    </td>
                </tr>
            </table>
        </div>
    `;
}
