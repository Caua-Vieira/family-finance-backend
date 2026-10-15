import { Singleton } from "typescript-ioc";
import { DailyRateDTO, InterestRateService } from "../../../domain/contracts/interest-rate-service";

// Série 12 do SGS (Banco Central): taxa DI diária, em % ao dia, por dia útil.
const CDI_SERIES_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

function toBcbDate(iso: string): string {
    const [year, month, day] = iso.split("-");
    return `${day}/${month}/${year}`;
}

function fromBcbDate(br: string): string {
    const [day, month, year] = br.split("/");
    return `${year}-${month}-${day}`;
}

@Singleton
export class BcbInterestRateService implements InterestRateService {
    private cache = new Map<string, { expiresAt: number; rates: DailyRateDTO[] }>();

    async getCdiDailyRates(startDate: string, endDate: string): Promise<DailyRateDTO[]> {
        const key = `${startDate}|${endDate}`;
        const cached = this.cache.get(key);
        if (cached && cached.expiresAt > Date.now()) return cached.rates;

        const url = `${CDI_SERIES_URL}?formato=json&dataInicial=${toBcbDate(startDate)}&dataFinal=${toBcbDate(endDate)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

        // O SGS responde 404 quando não há nenhum dia útil no intervalo.
        if (response.status === 404) return [];
        if (!response.ok) {
            throw new Error(`Banco Central respondeu ${response.status}`);
        }

        const data = (await response.json()) as { data: string; valor: string }[];
        const rates = data.map((item) => ({ date: fromBcbDate(item.data), rate: Number(item.valor) }));

        this.cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, rates });
        return rates;
    }
}
