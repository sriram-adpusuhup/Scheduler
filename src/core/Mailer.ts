import axios, {AxiosResponse} from 'axios';

export default class Mailer {

    static async sendMail(mailBody: string, subject: string): Promise<AxiosResponse<any>> {
        const url = `${process.env.RABBITMQ_PUBLISHABLE_URL}/publish`;
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