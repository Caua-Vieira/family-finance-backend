export interface WelcomeEmailData {
    to: string;
    name: string;
    householdName: string;
    inviteCode: string;
    isHouseholdCreator: boolean;
}

export abstract class MailService {
    abstract sendWelcomeEmail(data: WelcomeEmailData): Promise<void>;
}
