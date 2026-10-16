import { Inject } from "typescript-ioc";
import { InvestmentRepository } from "../../domain/contracts/investment-repository";
import { DailyRateDTO, InterestRateService } from "../../domain/contracts/interest-rate-service";
import { InvalidInvestmentException } from "../../domain/errors/errors";
import {
    INVESTMENT_INDEXERS,
    INVESTMENT_TYPES,
    InvestmentDTO,
    InvestmentEstimateDTO,
} from "../../domain/types/investment-dto";
import { Investment } from "../../infrastructure/entities/investment";
import { estimateInvestment } from "./utils/investment-estimate";

export type InvestmentWithEstimate = Investment & { estimate: InvestmentEstimateDTO };

// "Hoje" no horário de Brasília — o servidor roda em UTC.
function todayIso(): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// A API do Banco Central aceita no máximo 10 anos por consulta na série diária.
function maxSeriesStart(today: string): string {
    const [year, month, day] = today.split("-");
    return `${Number(year) - 10}-${month}-${day}`;
}

export class InvestmentUseCase {

    constructor(
        @Inject private readonly investmentRepository: InvestmentRepository,
        @Inject private readonly interestRateService: InterestRateService,
    ) { }

    async create(input: InvestmentDTO): Promise<Investment> {
        return this.investmentRepository.create(this.validate(input));
    }

    async update(input: InvestmentDTO): Promise<Investment> {
        return this.investmentRepository.update(this.validate(input));
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.investmentRepository.delete(id, householdId);
    }

    async list(householdId: string): Promise<InvestmentWithEstimate[]> {
        const investments = await this.investmentRepository.findByHouseholdId(householdId);
        const today = todayIso();

        const indexed = investments.filter((i) => i.indexer && i.rate && i.referenceDate);

        let cdi: DailyRateDTO[] = [];
        let ratesFailed = false;

        if (indexed.length > 0) {
            const earliest = indexed.map((i) => i.referenceDate!).sort()[0];
            const start = earliest < maxSeriesStart(today) ? maxSeriesStart(today) : earliest;
            try {
                cdi = await this.interestRateService.getCdiDailyRates(start, today);
            } catch (error) {
                console.error("InterestRateService.getCdiDailyRates:", error);
                ratesFailed = true;
            }
        }

        return investments.map((investment) => ({
            ...investment,
            estimate: this.estimate(investment, cdi, today, ratesFailed),
        }));
    }

    private estimate(
        investment: Investment,
        cdi: DailyRateDTO[],
        today: string,
        ratesFailed: boolean
    ): InvestmentEstimateDTO {
        const balance = Number(investment.currentValue);
        const invested = Number(investment.investedAmount);

        if (!investment.referenceDate) {
            return { value: balance, invested, contributionsApplied: 0, ratesUntil: null, yieldUnavailable: false };
        }

        const hasYield = Boolean(investment.indexer && investment.rate);

        const result = estimateInvestment(
            {
                balance,
                invested,
                referenceDate: investment.referenceDate,
                today,
                indexer: ratesFailed ? null : investment.indexer,
                rate: investment.rate != null ? Number(investment.rate) : null,
                monthlyContribution: Number(investment.monthlyContribution),
                contributionDay: investment.contributionDay,
            },
            cdi
        );

        return { ...result, yieldUnavailable: hasYield && ratesFailed };
    }

    private validate(input: InvestmentDTO): InvestmentDTO {
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
            throw new InvalidInvestmentException("Saldo atual inválido");
        }
        if (input.referenceDate && input.referenceDate > todayIso()) {
            throw new InvalidInvestmentException("A data do saldo não pode ser no futuro");
        }

        if (input.indexer) {
            if (!INVESTMENT_INDEXERS.includes(input.indexer)) {
                throw new InvalidInvestmentException("Indexador inválido");
            }
            if (input.type !== "fixed_income") {
                throw new InvalidInvestmentException("Rendimento automático só está disponível para renda fixa");
            }
            if (input.rate == null || !Number.isFinite(input.rate) || input.rate <= 0) {
                throw new InvalidInvestmentException("Informe a taxa do investimento");
            }
            if (!input.referenceDate) {
                throw new InvalidInvestmentException("Informe a data do saldo");
            }
        }

        if (!Number.isFinite(input.monthlyContribution) || input.monthlyContribution < 0) {
            throw new InvalidInvestmentException("Aporte mensal inválido");
        }
        if (input.monthlyContribution > 0) {
            const day = input.contributionDay;
            if (day == null || !Number.isInteger(day) || day < 1 || day > 31) {
                throw new InvalidInvestmentException("O dia do aporte deve ser um número entre 1 e 31");
            }
            if (!input.referenceDate) {
                throw new InvalidInvestmentException("Informe a data do saldo");
            }
        }

        return {
            ...input,
            rate: input.indexer ? input.rate : null,
            contributionDay: input.monthlyContribution > 0 ? input.contributionDay : null,
        };
    }
}
