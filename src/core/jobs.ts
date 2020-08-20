import axios from 'axios';
import Queue from 'bull';
import {ApiJob, RabbitMQJob, JobConfig} from '../utils/types';
import Mailer from './Mailer';

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
        .then(res => Promise.resolve({data: res.data}))
        .catch(err => Promise.reject(err));
    }

    static processRabbitMqJob(job: RabbitMQJob) {
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
        }).then(res =>  Promise.resolve(res.data))
        .catch(err => Promise.reject(err));
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