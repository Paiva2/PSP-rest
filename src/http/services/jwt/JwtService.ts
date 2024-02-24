import jwt from "jsonwebtoken";
import BadRequestException from "../../exceptions/BadRequestException";
import "dotenv/config";

export default class JwtService {
  private secret;
  private expTime;

  public constructor() {
    this.secret = process.env.JWT_SECRET as string;
    this.expTime = 60 * 60 * 24 * 7; // 7d
  }

  public sign(sub: string) {
    try {
      const token = jwt.sign(
        {
          data: sub,
        },
        this.secret,
        { expiresIn: this.expTime }
      );

      return token;
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Error while generating token.");
    }
  }
}
