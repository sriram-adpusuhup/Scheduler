import axios from 'axios';
import Queue from 'bull';
import {ApiJob, RabbitMQJob, JobConfig} from '../utils/types';
import Mailer from './Mailer';
import Logger from './../utils/Logger';

export default class Jobs {
    
    static processApiJob(jobConfig: ApiJob, jobId: string) {
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
        .then(res => {
            if (res.status === 200) {
                Logger.successLog(jobId, jobConfig);
                return Promise.resolve({data: res.data})
            }
            throw new Error(`Job failed with status ${res.status}`);
        })
        .catch(err => {
            Logger.failureLog(jobId, jobConfig, err);
        });
    }

    static processRabbitMqJob(job: RabbitMQJob, jobId: string) {
        const {data, queue} = job;
        if (!data) return Promise.reject();
        let path = '';
        if (Array.isArray(data)) {
            path = '/publishBulk'
        } else {
            path = '/publish'
        }
        
        return axios({
            url: `${process.env.RABBITMQ_PUBLISHABLE_URL}${path}`,
            method: 'POST',
            data: { queue, data },
        }).then(res => {
            Logger.successLog(jobId, job);
            return Promise.resolve(res.data)
        })
        .catch(err => {
            Logger.failureLog(jobId, job, err);
            return Promise.reject(err)
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
        const subject = 'Invalid Job Posted';
        try {
            const res = await Mailer.sendMail(mailBody, subject);
            if (res.status !== 200) {
                return Promise.reject({message: 'Mailer API sent an error'});
            }
            return Promise.resolve();
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }
}