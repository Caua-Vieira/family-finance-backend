import { Inject } from "typescript-ioc";
import { DashboardRepository } from "../../../domain/contracts/dashboard-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { Database } from "../../database/database";
import { CategorySpendingDTO, CategorySpendingRow, MonthlyTotalsDTO, MonthlyTotalsRow } from "../../../domain/types/dashboard-dto";

export class HttpDashboardRepository implements DashboardRepository {
    constructor(@Inject private database: Database) { }

    async getMonthlyTotals(householdId: string, month: number, year: number): Promise<MonthlyTotalsDTO> {
        try {
            const rows = await this.database.query<MonthlyTotalsRow[]>(
                `SELECT
                    COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
                    COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expenses
                 FROM transactions
                 WHERE household_id = $1
                   AND EXTRACT(MONTH FROM date) = $2
                   AND EXTRACT(YEAR FROM date) = $3`,
                [householdId, month, year]
            );

            return {
                income: Number(rows[0]?.income ?? 0),
                expenses: Number(rows[0]?.expenses ?? 0),
            };
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar os totais do mês");
        }
    }

    async getCategorySpending(householdId: string, month: number, year: number): Promise<CategorySpendingDTO[]> {
        try {
            const rows = await this.database.query<CategorySpendingRow[]>(
                `SELECT
                    c.id AS category_id,
                    c.name AS category_name,
                    COALESCE(b.estimated_amount, 0) AS budgeted,
                    COALESCE(spending.spent, 0) AS spent
                 FROM categories c
                 LEFT JOIN budgets b
                    ON b.category_id = c.id
                   AND b.month = $2
                   AND b.year = $3
                 LEFT JOIN LATERAL (
                    SELECT SUM(t.amount) AS spent
                    FROM transactions t
                    WHERE t.type = 'expense'
                      AND t.household_id = $1
                      AND EXTRACT(MONTH FROM t.date) = $2
                      AND EXTRACT(YEAR FROM t.date) = $3
                      AND (
                            t.category_id = c.id
                            OR t.category_id IN (SELECT sub.id FROM categories sub WHERE sub.parent_id = c.id)
                          )
                 ) spending ON true
                 WHERE c.household_id = $1
                   AND c.parent_id IS NULL
                 ORDER BY c.name ASC`,
                [householdId, month, year]
            );

            return rows.map((row) => ({
                categoryId: Number(row.category_id),
                categoryName: row.category_name,
                budgeted: Number(row.budgeted),
                spent: Number(row.spent),
            }));
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar os gastos por categoria");
        }
    }
}
