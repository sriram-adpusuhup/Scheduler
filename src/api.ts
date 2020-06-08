import express, {Request, Response} from 'express';
import Queue from './Queue';
import { JobOptions } from 'bull';
import {JobConfig} from './types';

export default class ApiRouter {

    static async publishScheduledJob(req: Request, res: Response): Promise<Response | void> {
        const processData = req.body as JobConfig;
        const jobOpts: JobOptions = {};
        if (req.query.delay) {
            jobOpts.delay = +req.query.delay;
        } else if (req.query.repeat) {
            jobOpts.repeat = {
                cron: req.query.repeat.toString(),
            }
        }

        const job = await Queue.getInstance().addJob(processData, jobOpts);
        return res.json({message: 'Job added successfully', job});
     }

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
        app.post('/api/publish', ApiRouter.publishScheduledJob);
        app.get('/api/ping', ApiRouter.pong);
    }
}