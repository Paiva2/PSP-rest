import jwt, { JwtPayload } from "jsonwebtoken";
import BadRequestException from "../../exceptions/BadRequestException";
import "dotenv/config";

export default class JwtService {
  private secret;
  private expTime;
  private issuer;

  public constructor() {
    this.secret = process.env.JWT_SECRET as string;
    this.expTime = 60 * 60 * 24 * 7; // 7d
    this.issuer = "psp-challenge";
  }

  public sign(subId: string): string {
    try {
      const token = jwt.sign(
        {
          subject: subId,
        },
        this.secret,
        { expiresIn: this.expTime, issuer: this.issuer, algorithm: "HS256" }
      );

      return token;
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Error while generating token.");
    }
  }

  public decode(token: string) {
    try {
      const tokenPayload = jwt.verify(token, this.secret, {
        algorithms: ["HS256"],
        issuer: this.issuer,
      }) as JwtPayload;

      return tokenPayload.subject;
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Error while decoding token.");
    }
  }
}
