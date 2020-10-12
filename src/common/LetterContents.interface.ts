import User from "./User.interface";
export default interface Letter {
    letterId: string;
    contents: string;
    requestor: User;
    writer: User;
    requestedAt: Date | null;
    uploadedAt: Date | null;
}