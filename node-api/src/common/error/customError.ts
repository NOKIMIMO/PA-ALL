export class CustomError {
    code: number;
    message: string;
    additionalInfo?: string;
    constructor(code: number, message: string, additionalInfo?: string) {
        this.code = code
        this.message = message
        additionalInfo = additionalInfo ? additionalInfo : ""
    }
}