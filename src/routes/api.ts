import express, {Request, Response} from 'express';
import SchedulerRoutes from './schedulerRoutes';
import AdpushupError from './../utils/AdpushupError';
import asyncHandler from './../utils/asyncHandler';

export default class ApiRouter {

    static async pong(req:Request, res:Response): Promise<Response> {
        const {
            body,
            query,
            params,
            headers
        } = req;
        console.log('----------------- PING API --------------------------------');
        console.log({
            body,
            query,
            params,
            headers
        })
        return res.json({message: 'PONG'});
     }


     static fallbackController(req: Request, res: Response): Response | void {
        const {
            body,
            query,
            params,
            headers
        } = req;
        console.log('---------------------------- FALLBACK API --------------------------------');
        console.log({
            body,
            query,
            params,
            headers
        })
        return res.send({}); 
    }

    static initRoutes(app: express.Application) {
        app.route('/api/ping').all(asyncHandler(ApiRouter.pong));
        app.post('/api/fallback', ApiRouter.fallbackController);
        app.use('/api/scheduler', new SchedulerRoutes().getRouter());
    }
}