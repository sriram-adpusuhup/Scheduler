import Queue, { JobOptions } from 'bull';
import {JobConfig, JobType, ApiJob, RabbitMQJob} from './types';
import Jobs from './jobs';

export default class AppQueue {

    private static instance?: AppQueue;
    private scheduledQueue: Queue.Queue;

    constructor() {
        this.scheduledQueue = new Queue('schedulerQueue', process.env.REDIS_HOST || 'redis://127.0.0.1:6379');
        this.scheduledQueue.process(this.queueProcess);
        return this;
    }

    static initialize(): void {
        if (!AppQueue.instance) {
            AppQueue.instance = new AppQueue()
        }
    }

    static getInstance(): AppQueue {
        if (!AppQueue.instance) {
            AppQueue.instance = new AppQueue();
        }
        return AppQueue.instance;
    }

    getQueues(): Queue.Queue[] {
        return [this.scheduledQueue];
    }

    queueProcess(job: Queue.Job<JobConfig>) {
        const { type, config } = job.data || {};
        switch(type) {
            case JobType.API:
                return Jobs.processApiJob(config as ApiJob);
            case JobType.RABBITMQ:
                return Jobs.processRabbitMqJob(config as RabbitMQJob);
            default: 
                return Jobs.processInvalidJob(job);
        }  
    }

    addJob(config: JobConfig, opts: JobOptions) {
        return this.scheduledQueue.add(config, opts);
    }

    static purge() {
        AppQueue.instance && AppQueue.instance.scheduledQueue.close();
    }

}