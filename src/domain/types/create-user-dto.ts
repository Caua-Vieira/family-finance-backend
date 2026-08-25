export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    householdName?: string;
    inviteCode?: string;
}