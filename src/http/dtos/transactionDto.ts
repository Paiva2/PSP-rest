import z from "zod";

export const createTransactionDTO = z.object({
  value: z.string(),
  method: z.string(),
  cardNumber: z
    .string()
    .max(19, { message: "cardNumber can't have more than 19 characters." })
    .min(18, { message: "cardNumber can't have less than 14 characters" }),
  cardValidationDate: z
    .string()
    .max(7, {
      message: "cardValidationDate can't have more than 7 characters.",
    })
    .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, {
      message: "cardValidationDate invalid format.",
    }),
  cardCvv: z
    .number()
    .min(3, { message: "cardCvv can't have more than 3 characters." }),
  description: z.string(),
  receiverId: z
    .string()
    .uuid({ message: "receiverId need to be an valid UUID." }),
});
