import express, {Request, Response} from 'express';
import SchedulerRoutes from './schedulerRoutes';

export default class ApiRouter {

     static pong(req:Request, res:Response): Response {
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

    static initRoutes(app: express.Application) {
        app.get('/api/ping', ApiRouter.pong);
        app.use('/api/scheduler', new SchedulerRoutes().getRouter());
    }
}