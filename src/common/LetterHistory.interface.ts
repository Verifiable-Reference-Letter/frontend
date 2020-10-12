import User from "./User.interface";
export default interface LetterHistory {
    letterId: number;
    requestor: User;
    writer: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
    recipient: User;
    sentAt: Date | null;
}