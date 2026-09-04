import { Inject } from "typescript-ioc";
import { RecurringTransactionRepository } from "../../../domain/contracts/recurring-transaction-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { RecurringTransaction } from "../../entities/recurring-transactions";
import { Database } from "../../database/database";
import { RecurringTransactionDTO } from "../../../domain/types/recurring-transaction-dto";

function toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export class HttpRecurringTransactionRepository implements RecurringTransactionRepository {
    constructor(@Inject private database: Database) { }

    async create(data: RecurringTransactionDTO): Promise<RecurringTransaction> {
        try {
            const repository = this.database.getRepository(RecurringTransaction);
            const rule = repository.create(data);
            return await repository.save(rule);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao criar a regra de recorrência");
        }
    }

    async update(data: RecurringTransactionDTO): Promise<RecurringTransaction> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(RecurringTransaction).update({ id, householdId }, rest);
        } catch {
            throw new DatabaseException("Ocorreu um erro ao atualizar a regra de recorrência");
        }

        if (!result.affected) {
            throw new NotFoundException("Regra de recorrência não encontrada");
        }

        return await this.findByIdOrFail(id!, householdId);
    }

    async delete(id: string, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(RecurringTransaction).delete({ id, householdId });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao excluir a regra de recorrência");
        }

        if (!result.affected) {
            throw new NotFoundException("Regra de recorrência não encontrada");
        }
    }

    async findByHouseholdId(householdId: string): Promise<RecurringTransaction[]> {
        try {
            return await this.database.getRepository(RecurringTransaction).find({
                where: { householdId },
                order: { active: "DESC", createdAt: "DESC" },
            });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar as regras de recorrência");
        }
    }

    async findActiveForPeriod(periodStart: Date, periodEnd: Date): Promise<RecurringTransaction[]> {
        try {
            return await this.database.query<RecurringTransaction[]>(
                `SELECT
                    id,
                    household_id AS "householdId",
                    type,
                    amount,
                    description,
                    category_id AS "categoryId",
                    card_id AS "cardId",
                    user_id AS "userId",
                    day_of_month AS "dayOfMonth",
                    start_date AS "startDate",
                    end_date AS "endDate",
                    active,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                 FROM recurring_transactions
                 WHERE active = true
                   AND start_date <= $1::date
                   AND (end_date IS NULL OR end_date >= $2::date)`,
                [toDateString(periodEnd), toDateString(periodStart)]
            );
        } catch (error) {
            console.error("findActiveForPeriod:", error);
            throw new DatabaseException("Ocorreu um erro ao buscar as regras de recorrência");
        }
    }

    private async findByIdOrFail(id: string, householdId: string): Promise<RecurringTransaction> {
        let rule;
        try {
            rule = await this.database.getRepository(RecurringTransaction).findOne({ where: { id, householdId } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar a regra de recorrência");
        }

        if (!rule) {
            throw new NotFoundException("Regra de recorrência não encontrada");
        }

        return rule;
    }
}
