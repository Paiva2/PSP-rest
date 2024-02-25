import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const zodDtoValidation = (zodObject: AnyZodObject) => {
  return (request: Request, response: Response, next: NextFunction) => {
    try {
      zodObject.parse(request.body);

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);

        const errors = validationError.details.map((error) => error.message);

        return response.status(422).send({
          statusCode: 422,
          errors,
        });
      }
    }
  };
};
