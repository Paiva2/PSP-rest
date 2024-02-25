import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, JsonWebTokenError } from "jsonwebtoken";
import ForbiddenException from "../exceptions/ForbiddenException";
import "dotenv/config";

export default function jwtHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.headers.authorization) {
    throw new ForbiddenException("Authorization header missing.");
  }

  const authorization = req.headers.authorization.replace("Bearer ", "");

  const issuer = "psp-challenge";

  try {
    jwt.verify(authorization, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
      issuer,
    }) as JwtPayload;

    next();
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      return res.status(403).send({ message: e.message });
    }
  }
}
