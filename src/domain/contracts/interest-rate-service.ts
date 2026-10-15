export interface DailyRateDTO {
    date: string; // YYYY-MM-DD (dia útil)
    rate: number; // taxa do dia, em % (ex.: 0.051660)
}

export abstract class InterestRateService {
    /** Taxa diária do CDI de cada dia útil entre as datas (inclusive). */
    abstract getCdiDailyRates(startDate: string, endDate: string): Promise<DailyRateDTO[]>;
}
