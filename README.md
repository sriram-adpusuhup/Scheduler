# SCHEDULER SERVICE
This service would serve as a common service incharge of scheduling jobs and executing them as needed.
Any job that you need to add should just have a REST API endpoint to perform the JOB or a AP RabbitMQ queue.

### CHECKLIST
- [x] Add a delayed job
    - [x] API JOB
    - [x] RabbitMQ JOB
- [x] Add a cron job
    - [x] API CRON
    - [x] RabbitMQ CRON
- [x] Cancel a running job
    - [x] Delayed Job
    - [x] CRON Job
- [x] Retry Support for jobs with fallback strategy
- [x] Default fallback incase of no fallbakc strategy
- [x] Login UI before accessing /admin (Authorized)
- [x] Start date and End date support for cron jobs

### FURTHER PLANS
- [] Get job status [ Facing challenges because repeatable jobs keeps changing ID ]
- [] API Documentation [In Progress]
- [] E2E tests
- [] Eslint/Prettier setup
- [] Run tests automatically before a commit.
- [] Add admin authentication for administrative API's
- [] Get all jobs (Authorized)
- [] Purge all jobs (Authorized)

