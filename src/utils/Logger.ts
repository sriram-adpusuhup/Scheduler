import {v4 as uuid} from 'uuid';
import { couchbaseService } from 'node-utils';
import os from 'os';
import { ApiJob, RabbitMQJob } from './types';

class Logger {

    private globalBucketDbHelper: any;
    private static instance: Logger;

    constructor(couchbaseConfig) {
        this.globalBucketDbHelper = couchbaseService(
            couchbaseConfig.HOST,
            couchbaseConfig.LOG_BUCKET,
            couchbaseConfig.USER_NAME,
            couchbaseConfig.PASSWORD
        );
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger({
                HOST: process.env.COUCHBASE_HOST,
                LOG_BUCKET: process.env.COUCHBASE_LOG_BUCKET,
                USER_NAME: process.env.COUCHBASE_USER_NAME,
                PASSWORD: process.env.COUCHBASE_PASSWORD
            });
        }
        return Logger.instance;
    }

    log(logData: any) {
        const hostname = os.hostname();
       
        this.globalBucketDbHelper
        .createDoc(
            `slog::${uuid()}`,
            {
				date: +new Date(),
				type: logData.type || 3,
				source: logData.source || 'Queue Worker Logs',
				message: logData.message || 'N/A',
				details: logData.details || 'N/A',
				debugData: JSON.stringify(logData.debugData) || 'N/A',
				hostname: hostname
            },
            {
				expiry: Math.floor(Date.now() / 1000) + 2592000
			}
        )
		.then(() => console.log('Log written to apGlobalBucket'))
		.catch(err => console.log('Error writing log to apGlobalBucket : ', err.message));
    }

    static successLog(jobId: string, jobConfig: ApiJob | RabbitMQJob) {
        Logger.getInstance().log({
            source: 'SCHEDULER SUCCESS LOGS',
            message: 'Scheduled Job Successful',
            details: `Job completed successfully - ${jobId}`,
            debugData: jobConfig
        });
    }

    static failureLog(jobId: string, jobConfig: ApiJob | RabbitMQJob, err: Error) {
        Logger.getInstance().log({
            source: 'SCHEDULER FAILURE LOGS',
            message: 'API Job Failed',
            details: `API JOB failed - ID: ${jobId} , Error: ${JSON.stringify(err)}`,
            debugData: jobConfig
        });
    }
}

export default Logger;