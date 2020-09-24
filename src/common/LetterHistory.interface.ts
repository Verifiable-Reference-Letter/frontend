import User from "./UserAuth.interface";
export default interface LetterHistory {
    letterId: number;
    requestor: User;
    writer: User;
    recipient: User;
}