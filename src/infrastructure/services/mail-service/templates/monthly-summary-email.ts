import { MonthlySummaryEmailData } from "../../../../domain/contracts/mail-service";

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercentage(value: number | null): string {
    if (value === null) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
}

export function buildMonthlySummaryEmailHtml(data: MonthlySummaryEmailData): string {
    const { summary } = data;
    const monthLabel = `${MONTH_NAMES[summary.month - 1]} de ${summary.year}`;
    const balanceColor = summary.balance >= 0 ? "#0f766e" : "#b91c1c";

    const topCategories = [...summary.categories]
        .filter((category) => category.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

    const categoriesRows = topCategories.length > 0
        ? topCategories.map((category) => `
            <tr>
                <td style="padding:8px 0;font-size:14px;color:#1f2937;border-bottom:1px solid #f0f0f0;">${category.categoryName}</td>
                <td style="padding:8px 0;font-size:14px;color:#1f2937;text-align:right;border-bottom:1px solid #f0f0f0;">${formatCurrency(category.spent)}</td>
            </tr>
        `).join("")
        : `<tr><td style="padding:8px 0;font-size:14px;color:#6b7280;" colspan="2">Nenhum gasto registrado neste mês.</td></tr>`;

    return `
        <div style="background-color:#f4f5f7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <div style="background-color:#0f766e;padding:24px 32px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;">Family Finance</h1>
                    <p style="margin:4px 0 0;color:#d1fae5;font-size:13px;">Resumo de ${monthLabel} — ${data.householdName}</p>
                </div>
                <div style="padding:32px;color:#1f2937;">
                    <p style="font-size:16px;margin:0 0 24px;">Olá, ${data.name}! Aqui está o resumo financeiro do mês.</p>

                    <div style="background-color:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr>
                                <td style="padding:4px 0;font-size:14px;color:#4b5563;">Receitas</td>
                                <td style="padding:4px 0;font-size:14px;color:#1f2937;text-align:right;">${formatCurrency(summary.income)}</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;font-size:14px;color:#4b5563;">Despesas</td>
                                <td style="padding:4px 0;font-size:14px;color:#1f2937;text-align:right;">${formatCurrency(summary.expenses)}</td>
                            </tr>
                            <tr>
                                <td style="padding:8px 0 0;font-size:15px;font-weight:bold;color:#1f2937;border-top:1px solid #e5e7eb;">Saldo</td>
                                <td style="padding:8px 0 0;font-size:15px;font-weight:bold;color:${balanceColor};text-align:right;border-top:1px solid #e5e7eb;">${formatCurrency(summary.balance)}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="font-size:13px;color:#6b7280;margin:0 0 24px;">
                        Despesas em relação ao mês anterior: <strong style="color:#1f2937;">${formatPercentage(summary.previousMonth.expensesVariationPercentage)}</strong>
                    </p>

                    <p style="font-size:14px;font-weight:bold;color:#1f2937;margin:0 0 12px;">Maiores gastos por categoria</p>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
                        ${categoriesRows}
                    </table>
                </div>
                <div style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="font-size:12px;color:#9ca3af;margin:0;">Você recebeu este e-mail porque faz parte da família ${data.householdName} no Family Finance.</p>
                </div>
            </div>
        </div>
    `;
}
