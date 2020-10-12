import User from "./User.interface";
export default interface LetterDetails {
    letterId: string;
    letterRequestor: User;
    letterWriter: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
}