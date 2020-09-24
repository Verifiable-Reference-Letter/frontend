import User from "./User.interface";
export default interface Letter {
    letterId: number;
    contents: File;
    requestor: User;
    writer: User;
}