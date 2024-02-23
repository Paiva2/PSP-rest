import { NextFunction, Request, Response } from "express";

export default function globalExceptionHandler(
  error: any,
  _: Request,
  response: Response,
  next: NextFunction
) {
  return response
    .status(error.cause.status ?? 500)
    .send({ message: error.message, statusCode: error.cause.status });
}
