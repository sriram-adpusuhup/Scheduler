type ErrorResult = {status: string; statusCode: number; message: string};

export default class AdpushupError extends Error {

    private statusCode: number;
    private status: string;
    constructor(message: string, statusCode: number = 500) {
      super(message);
  
      this.statusCode = statusCode;
  
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
      Error.captureStackTrace(this, this.constructor);
    }

    getStatusCode(): number {
        return this.statusCode;
    }

    toJSON(): ErrorResult {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
        }
    }
  }
  
  module.exports = AdpushupError;