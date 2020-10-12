import User from "./User.interface";
export default interface LetterHistory {
    letterId: string;
    requestor: User;
    writer: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
    recipient: User;
    sentAt: Date | null;
}