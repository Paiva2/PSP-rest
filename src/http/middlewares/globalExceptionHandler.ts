import { NextFunction, Request, Response } from "express";

export default function globalExceptionHandler(
  error: Error,
  _: Request,
  response: Response,
  next: NextFunction
) {
  if (error instanceof Error) {
    const status = error.cause.status ? error.cause.status : 500;

    return response.status(status).send({
      message: error.message ?? "Internal server error.",
      statusCode: status,
    });
  }

  next();
}
