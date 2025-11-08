import { TokenGenerator } from "../../application/services/TokenGenerator";
import * as jwt from "jsonwebtoken";

export class JwtTokenGenerator implements TokenGenerator {
    private readonly secretKey: string;
    private readonly expiresIn: string;

    constructor(secretKey: string, expiresIn: string = "1h") {
        this.secretKey = secretKey;
        this.expiresIn = expiresIn;
    }
    generate(payload: object): string {
        const token = jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
        return token;
    }
    verify(token: string): object | null {
        try {
            const decoded = jwt.verify(token, this.secretKey);
            return decoded as object;
        } catch (error) {
            return null;
        }
    }
}
