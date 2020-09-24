import User from "./UserAuth.interface";
export default interface LetterDetails {
    letterId: number;
    requestor: User;
    writer: User;
}