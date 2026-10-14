import { Inject } from "typescript-ioc";
import { InvestmentRepository } from "../../domain/contracts/investment-repository";
import { InvalidInvestmentException } from "../../domain/errors/errors";
import { INVESTMENT_TYPES, InvestmentDTO } from "../../domain/types/investment-dto";
import { Investment } from "../../infrastructure/entities/investment";

export class InvestmentUseCase {

    constructor(
        @Inject private readonly investmentRepository: InvestmentRepository
    ) { }

    async create(input: InvestmentDTO): Promise<Investment> {
        this.validate(input);
        return this.investmentRepository.create(input);
    }

    async update(input: InvestmentDTO): Promise<Investment> {
        this.validate(input);
        return this.investmentRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.investmentRepository.delete(id, householdId);
    }

    async list(householdId: string): Promise<Investment[]> {
        return this.investmentRepository.findByHouseholdId(householdId);
    }

    private validate(input: InvestmentDTO): void {
        if (!input.name) {
            throw new InvalidInvestmentException("Informe o nome do investimento");
        }
        if (!INVESTMENT_TYPES.includes(input.type)) {
            throw new InvalidInvestmentException("Tipo de investimento inválido");
        }
        if (!Number.isFinite(input.investedAmount) || input.investedAmount < 0) {
            throw new InvalidInvestmentException("Valor aplicado inválido");
        }
        if (!Number.isFinite(input.currentValue) || input.currentValue < 0) {
            throw new InvalidInvestmentException("Valor atual inválido");
        }
    }
}
