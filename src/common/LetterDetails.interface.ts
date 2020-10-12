import User from "./User.interface";
export default interface LetterDetails {
    letterId: string;
    requestor: User;
    writer: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
}