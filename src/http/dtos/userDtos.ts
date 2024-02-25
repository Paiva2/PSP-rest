import z from "zod";

export const userCreationDTO = z.object({
  newUser: z.object({
    email: z.string().email({ message: "email must be an valid e-mail." }),
    password: z
      .string()
      .min(6, { message: "password must have at least 6 characters." }),
    fullName: z
      .string()
      .min(3, { message: "fullName must have at least 3 characters." }),
  }),
});

export const authUserDTO = z.object({
  email: z.string().email({ message: "email must be an valid e-mail." }),
  password: z
    .string()
    .min(6, { message: "password must have at least 6 characters." }),
});
