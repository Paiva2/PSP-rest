import { NextFunction, Request, Response } from "express";

export default function globalExceptionHandler(
  error: any,
  _: Request,
  response: Response,
  next: NextFunction
) {
  const status = error.cause.status;

  return response.status(status).send({
    message: error.message ?? "Internal server error.",
    statusCode: status,
  });
}
