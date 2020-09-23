import User from "./User.interface";
export default interface Letter {
    letter_id: number;
    contents: File;
    writer: User;
    requestor: User;
}