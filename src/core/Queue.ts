import Queue, { JobOptions, Job } from 'bull';
import {JobConfig, JobType, ApiJob, RabbitMQJob} from '../utils/types';
import Jobs from './jobs';
import QueueListeners from './QueueListeners';

export default class AppQueue {

    private static instance?: AppQueue;
    private scheduledQueue: Queue.Queue;

    constructor() {
        this.scheduledQueue = new Queue('schedulerQueue', {
            redis: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT || '6379')
            }
        });
        this.scheduledQueue.process(this.queueProcess);
        this.setupQueueListeners();
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

    setupQueueListeners() {
        this.scheduledQueue
            .on('active', QueueListeners.onActive)
            .on('error', QueueListeners.onError)
            .on('waiting', QueueListeners.onWaiting)
            .on('completed', QueueListeners.onCompleted)
            .on('stalled', QueueListeners.onStalled)
            .on('failed', QueueListeners.onFailed)
            .on('cleaned', QueueListeners.onClean)
            .on('removed', QueueListeners.onRemoved)
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

    getJob(jobId: string): Promise<Job<JobConfig> | null> {
        return this.scheduledQueue.getJob(jobId);
    }

    getRepeatableJobs(): Promise<Queue.JobInformation[]> {
        return this.scheduledQueue.getRepeatableJobs();
    }

    async removeRepeatableJob(jobKey: string): Promise<void> {
        return this.scheduledQueue.removeRepeatableByKey(jobKey);
    }

    async removeAllRepeatable(): Promise<void> {
        const repeatableJobs = await this.scheduledQueue.getRepeatableJobs();
        for (let job of repeatableJobs) {
            await this.removeRepeatableJob(job.key);
        }
        return Promise.resolve();
    }

}