import User from "./User.interface";
export default interface SentLetter {
    letter_id: number;
    writer: User;
    requestor: User;
    recipient: User;
}