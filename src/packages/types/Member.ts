export type Member = {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    blocked: boolean;
    qrUuid: string;
    emailValid: boolean;
}