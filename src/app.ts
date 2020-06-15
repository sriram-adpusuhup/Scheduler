import express, {Request, Response} from 'express';
import path from 'path';
import {setQueues, UI} from 'bull-board';
import Queue from './core/Queue';
import ApiRouter from './routes/api';
import globalErrorHandler from './globalErrorHandler';

setQueues(Queue.getInstance().getQueues());

process.on('unhandledRejection', (e: Error) => {
    console.error(e.message);
    console.log(e.stack);
})

const app = express();
app.use(express.json());

// Setting up pug for UI
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving Static files
app.use(express.static(path.join(__dirname, 'public')));
// access queue monitoring UI at /admin
app.use('/admin', UI);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).render('index');
});

// init api routes
ApiRouter.initRoutes(app);

app.use(globalErrorHandler);

export default app;