import { Job } from 'bull';
import axios from 'axios';
import { JobConfig } from '../utils/types';
import Mailer from './Mailer';

export default class QueueListener {

    static onError(err: Error): void {
        console.error(err);
    };

    static onWaiting(jobId: string): void {
        console.log(`Job with ID ${jobId} is waiting`);
    }

    static onActive(job: Job<JobConfig>, jobPromise: Promise<Job<JobConfig>>): void {
        console.log(`Job with ID ${job.id} active`);
    }

    static onStalled(job: Job<JobConfig>): void {
        console.log(`Job with ID ${job.id} stalled`);
        //TODO: log stalled request. These requests are most probably double processed.
    }

    static onCompleted(job: Job<JobConfig>, result: any): void {
        console.log(`Job with ID ${job.id} completed`);
        console.log({result});
    }

    static onFailed(job: Job<JobConfig>, err: Error) {
        console.log(`Job with ID ${job.id} failed. Attempts made ${job.attemptsMade}. Max attempts ${job.opts.attempts}`);
        if (job.opts.attempts && job.attemptsMade === job.opts.attempts) {
            // if max attempts reached, execute fallback logic.
            const jobConfig = job.data;
            if (jobConfig.retryOptions?.fallbackUrl) {
                const apiBody = {
                    ...jobConfig,
                    id: job.id,
                    error: err
                }
                console.log(`Sending fallback hook`);
                return axios.post(jobConfig.retryOptions.fallbackUrl, apiBody);
            } else {
                // if no fallback, mail admin that the job has failed repeatedly
                const { id: jobId, data: jobData, name: jobName, opts: jobOpts, timestamp } = job;
                const subject = `Job - ${jobId} failed ${job.attemptsMade} times`;
                const mailBody = `
                    <h1> Job Failed Repeatedly </h1>
                    <div>
                        <p> Job ID : ${jobId} </p>
                        <p> Job Name: ${jobName} </p>
                        <p> Timestamp: ${timestamp} </p
                        <div> <p> JobData : </p>
                        <code> ${JSON.stringify(jobData)} </code> </div>
                        <div> <p> JobOptions : </p>
                        <code> ${JSON.stringify(jobOpts)} </code> </div>
                    </div>
               `;
               return Mailer.sendMail(mailBody, subject);
            }
        }
    }
    
    static onClean(jobs: Job<JobConfig>[], type: string): void {
        console.log(`Jobs cleaned ${jobs.length}`);
        console.log(JSON.stringify(jobs));
    }

    static onRemoved(job: Job<JobConfig>): void {
        console.log(`Job with ID ${job.id} removed`);
    }
}