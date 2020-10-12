import User from "./User.interface";
export default interface Letter {
    letterId: string;
    contents: string;
    letterRequestor: User;
    letterWriter: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
}