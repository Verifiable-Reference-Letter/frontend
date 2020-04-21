import User from "./User.interface";
export default interface SentLetter {
    letter_id: number;
    writer: User;
    requester: User;
    recipient: User;
}