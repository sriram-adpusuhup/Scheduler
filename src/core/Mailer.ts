import axios, {AxiosResponse} from 'axios';

export default class Mailer {

    static async sendMail(mailBody: string, subject: string): Promise<AxiosResponse<any>> {
        const url = 'https://queuepublisher.adpushup.com/publish';
        const email = 'sriram.r@adpushup.com';
        const apiBody = {
            queue: 'MAILER',
            data: { 
                to: email,
                body: mailBody,
                subject,
            }
        };
        return axios.post(url, apiBody);
    }
}