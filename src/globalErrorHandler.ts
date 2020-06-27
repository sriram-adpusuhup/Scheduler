import { NextFunction, Request, Response } from 'express';
import AdpushupError from './utils/AdpushupError';

const sendErrorDev = (err: Error, res: Response) => {
    if (err instanceof AdpushupError) {
        return res.status(err.getStatusCode()).json({
            ...err.toJSON(),
            stack: err.stack,
        });
    } else {
        return res.status(500).json({message: err.message || 'Unknown error', stack: err.stack});
    }
};
  
const sendErrorProd = (err: Error, res: Response) => {
    if (err instanceof AdpushupError) {
        //Operational Error so send details
        return res.status(err.getStatusCode()).json(err.toJSON());
    } else {
      //Programming error so send generic error status
      return res
        .status(500)
        .json({ status: 'error', message: 'Something went wrong' });
    }
};

const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    err.message = err.message || 'error!';
  
    if (process.env.NODE_ENV != 'production') sendErrorDev(err, res);
    else sendErrorProd(err, res);
}

export default globalErrorHandler;