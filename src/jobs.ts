import axios from 'axios';
import {ApiJob, RabbitMQJob} from './types';

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
        .catch(() => Promise.reject());
    }

    static processRabbitMqJob(job: RabbitMQJob) {
        return Promise.resolve()
    }

    static processInvalidJob(job: any) {
        return Promise.reject();
    }
}