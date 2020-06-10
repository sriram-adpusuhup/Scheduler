import { Job } from 'bull';
import { JobConfig } from './../types';

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
        console.error(err);
        if (job.opts.attempts && job.attemptsMade === job.opts.attempts) {
            //TODO: if job has retries and if reached max retires, execute backoff logic
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