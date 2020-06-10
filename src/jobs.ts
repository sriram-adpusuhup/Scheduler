import axios from 'axios';
import Queue from 'bull';
import {ApiJob, RabbitMQJob, JobConfig} from './types';

export default class Jobs {
    static processApiJob(jobConfig: ApiJob) {
        const {
            url: apiUrl,
            query: queryParams,
            headers,
            type: requestType,
            body: requestBody
        } = jobConfig;

        let url = `${apiUrl}?`;

        queryParams && Object.keys(queryParams).forEach(key => {
            url = `${url}${key}=${queryParams[key]}&`;
        });

        return axios({
            url,
            headers,
            data: requestBody,
            method: requestType
        })
        .then(() => Promise.resolve())
        .catch(err => Promise.reject(err));
    }

    static processRabbitMqJob(job: RabbitMQJob) {
        console.log('Processing RabbitMQ Job');
        const {data, queue} = job;
        if (!data) return Promise.reject();
        let path = '';
        if (Array.isArray(data)) {
            path = '/publishBulk'
        } else {
            path = '/publish'
        }
        
        return axios({
            url: `https://queuepublisher.adpushup.com${path}`,
            method: 'POST',
            data: { queue, data },
        }).then(() =>  Promise.resolve())
        .catch(err => {
            return Promise.reject(err);
        });
    }

    static async processInvalidJob(job: Queue.Job<JobConfig>) {
        const { id: jobId, data: jobData, name: jobName, opts: jobOpts, timestamp } = job;
        const mailBody = `
            <h1> Invalid Job processed </h1>
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
        const email = 'sriram.r@adpushup.com';
        const url = 'https://queuepublisher.adpushup.com/publish';
        const apiBody = {
            queue: 'MAILER',
            data: { 
                to: email,
                body: mailBody,
                subject: 'Invalid Job Published - Scheduler'
            }
        }
        try {
            console.log('Sending Request');
            const res = await axios.post(url, apiBody);
            console.log(res);
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }
}