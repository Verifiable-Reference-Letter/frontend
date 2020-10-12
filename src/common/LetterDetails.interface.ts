import User from "./User.interface";
export default interface LetterDetails {
    letterId: number;
    requestor: User;
    writer: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
}