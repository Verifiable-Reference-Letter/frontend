import User from "./User.interface";
export default interface Letter {
    letter_id: number;
    writer: User;
    requester: User;
    letter_uploaded: boolean;
}