import express, {Response, Request} from 'express';
import Bull, {JobOptions} from 'bull';
import { v4 as uuid } from 'uuid';
import {JobConfig, ExecutionType} from '../utils/types';
import Queue from './../core/Queue';
import asyncHandler from './../utils/asyncHandler';
import AdpushupError from './../utils/AdpushupError';
import {JOB_KEYS} from './../utils/constants';

export default class SchedulerRoutes {

    private router: express.Router = express.Router();
    
    static async scheduleJobController(req: Request, res: Response): Promise<Response | void> {
        const processData = req.body as JobConfig;
        const {executionOptions, retryOptions} = processData;
        let jobId = uuid(); 
        const jobOpts: JobOptions = {};

        if (executionOptions.type === ExecutionType.DELAY) {
            jobOpts.delay = +executionOptions.value;
            jobId = `${JOB_KEYS.DELAYED_JOB_PREFIX}${jobId}`;
        } else if (executionOptions.type === ExecutionType.REPEAT) {
            const repeatOptions: Bull.CronRepeatOptions = {
                cron: executionOptions.value.toString(),
            };
            if (executionOptions.startDate)
                repeatOptions.startDate = new Date(executionOptions.startDate);
            if (executionOptions.endDate)
                repeatOptions.endDate = new Date(executionOptions.endDate);
            jobOpts.repeat = repeatOptions;
            jobId = `${JOB_KEYS.REPEATED_JOB_PREFIX}${jobId}`;
        }
        retryOptions && (jobOpts.attempts = retryOptions?.attempts);
        jobOpts.jobId = jobId;
        const job = await Queue.getInstance().addJob(processData, jobOpts);
        // repeated job doesn't override the ID we created. 
        // It changes it's ID in each execution. So we send this back to identify the repeating job with a key which will contain the ID we generated in between
        return res.json({message: 'Job added successfully', job: { ...job.toJSON(), id: jobId} });
     }

     static async cancelJobScheduler(req: Request, res: Response): Promise<Response | void> {
        const jobId = req.params.id;
        const isRepeatableJob = jobId.startsWith(JOB_KEYS.REPEATED_JOB_PREFIX);

        if (isRepeatableJob) {
            const repeatableJobs = await Queue.getInstance().getRepeatableJobs();
            const jobWithId = repeatableJobs.filter(job => job.key.includes(jobId))[0];
            console.log({jobWithId});
            if (!jobWithId) throw new AdpushupError('Job not found', 404);
            await Queue.getInstance().removeRepeatableJob(jobWithId.key);
        } else {
            const job = await Queue.getInstance().getJob(jobId);
            if (!job) throw new AdpushupError('Job not found or job completed', 404);
    
            const isJobCompleted = await job.isCompleted();
            // job is already completed
            if (isJobCompleted) throw new AdpushupError('Job already completed', 400);
            
            const isJobFailed = await job.isFailed();
            // job fails and has no retries configuration
            if (!job.opts.attempts && isJobFailed) throw new AdpushupError('Job has failed', 400)
            
            // if job failed and reached max attempts
            if (isJobFailed && job.opts.attempts && job.opts.attempts === job.attemptsMade) 
                throw new AdpushupError('Job has already failed and reached max attempts', 400)
                
            await job.remove();
        }
        
        return res.json({message: 'Job cancelled successfully'});
     }

     static async jobDetailsController(req: Request, res: Response): Promise<Response | void> {
         const jobId = req.params.id;
         const isRepeatableJob = jobId.startsWith(JOB_KEYS.REPEATED_JOB_PREFIX);

         if (isRepeatableJob) throw new AdpushupError('Querying job details of a repeatable job is not supported yet', 404);
         else {
            const job = await Queue.getInstance().getJob(jobId);
            if (!job) throw new AdpushupError('Job not found or job has been long completed before 10 days', 404);
            return res.json(job.toJSON());
         }
    }

    static async removeRepeatable(req: Request, res: Response): Promise<Response | void> {
        await Queue.getInstance().removeAllRepeatable();
        return res.json({message: 'OK'});
    }

    static async getAllRepeatableJobsController(req: Request, res: Response): Promise<Response | void> {
        const jobs = await Queue.getInstance().getRepeatableJobs();
        return res.json(jobs);
    }

    constructor() {
        this.router.post('/schedule', asyncHandler(SchedulerRoutes.scheduleJobController));
        this.router.delete('/cancel/:id', asyncHandler(SchedulerRoutes.cancelJobScheduler));
        this.router.get('/job/:id', asyncHandler(SchedulerRoutes.jobDetailsController));
        this.router.post('/removeRepeatable', asyncHandler(SchedulerRoutes.removeRepeatable));
        this.router.get('/getAllRepeatable', asyncHandler(SchedulerRoutes.getAllRepeatableJobsController))
    }

    getRouter() {
        return this.router;
    }

}