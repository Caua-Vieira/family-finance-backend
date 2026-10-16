import { Inject } from "typescript-ioc";
import { InvestmentRepository } from "../../../domain/contracts/investment-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { Investment } from "../../entities/investment";
import { Database } from "../../database/database";
import { InvestmentDTO } from "../../../domain/types/investment-dto";

export class HttpInvestmentRepository implements InvestmentRepository {
    constructor(@Inject private database: Database) { }

    async create(data: InvestmentDTO): Promise<Investment> {
        try {
            const repository = this.database.getRepository(Investment);
            return await repository.save(repository.create(data));
        } catch (error) {
            console.error("Investment.create:", error);
            throw new DatabaseException("Ocorreu um erro ao registrar o investimento");
        }
    }

    async update(data: InvestmentDTO): Promise<Investment> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(Investment).update({ id, householdId }, rest);
        } catch (error) {
            console.error("Investment.update:", error);
            throw new DatabaseException("Ocorreu um erro ao atualizar o investimento");
        }

        if (!result.affected) {
            throw new NotFoundException("Investimento não encontrado");
        }

        let investment;
        try {
            investment = await this.database.getRepository(Investment).findOne({ where: { id, householdId } });
        } catch (error) {
            console.error("Investment.findOne:", error);
            throw new DatabaseException("Ocorreu um erro ao buscar o investimento");
        }

        if (!investment) {
            throw new NotFoundException("Investimento não encontrado");
        }

        return investment;
    }

    async delete(id: string, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(Investment).delete({ id, householdId });
        } catch (error) {
            console.error("Investment.delete:", error);
            throw new DatabaseException("Ocorreu um erro ao excluir o investimento");
        }

        if (!result.affected) {
            throw new NotFoundException("Investimento não encontrado");
        }
    }

    async findByHouseholdId(householdId: string): Promise<Investment[]> {
        try {
            return await this.database.getRepository(Investment).find({
                where: { householdId },
                order: { currentValue: "DESC", name: "ASC" },
            });
        } catch (error) {
            console.error("Investment.findByHouseholdId:", error);
            throw new DatabaseException("Ocorreu um erro ao buscar os investimentos");
        }
    }
}
