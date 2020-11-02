import User from "./User.interface";
export default interface LetterHistory {
    letterId: string;
    letterRequestor: User;
    letterWriter: User;
    requestedAt: Date;
    uploadedAt: Date | null;
    letterRecipient: User;
    sentAt: Date | null;
}