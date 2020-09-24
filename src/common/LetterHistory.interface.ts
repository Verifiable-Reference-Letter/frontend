import User from "./User.interface";
export default interface LetterHistory {
    letterId: number;
    requestor: User;
    writer: User;
    recipient: User;
}