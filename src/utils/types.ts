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

export enum ExecutionType {
    DELAY = 'delay',
    REPEAT = 'repeat'
};

export type ExecutionOption = {
    type: ExecutionType;
    value: string | number;
    // start date and end date only supported for ExecutionType.REPEAT
    startDate?: string;
    endDate?: string
}

export type JobConfig = {
    type: JobType;
    config: ApiJob | RabbitMQJob;
    executionOptions: ExecutionOption;
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
