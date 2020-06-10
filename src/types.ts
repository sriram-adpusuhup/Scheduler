export enum JobType {
    API = 'API',
    RABBITMQ = 'RABBITMQ',
}

export enum RabbitMQJobType {
    SINGLE = 'SINGLE',
    BULK = 'BULK',
}

export enum RequestType {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export type JobConfig = {
    type: JobType;
    config: any;
    retryOptions?: RetryOptions;
};

export type RetryOptions = {
    attempts: number;
    fallbackUrl?: string;
}

export type ApiJob = {
    url: string;
    type: RequestType;
    query?: any;
    headers?: any;
    body?: any
};

export type RabbitMQJob = {
    data: any;
    queue: string;
}
