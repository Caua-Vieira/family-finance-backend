export interface CreateUserDTO {
    name: string;
    email: string;
    // Ausente em contas criadas pelo Google
    password?: string;
    googleId?: string;
    householdName?: string;
    inviteCode?: string;
}