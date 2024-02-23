export class GlobalException extends Error {
  constructor(message: string, status: number) {
    super(message, {
      cause: {
        status: status || 500,
      },
    });

    this.message = message;
  }
}
