import express, {Request, Response} from 'express';
import {JobOptions} from 'bull';
import {JobConfig} from './../types';
import Queue from './../core/Queue';

export default class SchedulerRoutes {

    private router: express.Router = express.Router();
    
    static async scheduleJobController(req: Request, res: Response): Promise<Response | void> {
        const processData = req.body as JobConfig;
        const jobOpts: JobOptions = {
            attempts: 2
        };
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

     static async cancelJobScheduler(req: Request, res: Response): Promise<Response | void> {
        const jobId = req.params.id;
        const job = await Queue.getInstance().getJob(jobId);
        if (!job) {
            return res.status(404).json({message: 'Job not found or Job completed'});
        }
        await job.remove()
        return res.json({message: 'Job cancelled successfully'});
     }

    constructor() {
        this.router.post('/schedule', SchedulerRoutes.scheduleJobController);
        this.router.patch('/cancel/:id', SchedulerRoutes.cancelJobScheduler);
    }

    getRouter() {
        return this.router;
    }

}