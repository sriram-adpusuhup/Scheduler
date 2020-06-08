import express, {Request, Response} from 'express';
import path from 'path';
import {setQueues, UI} from 'bull-board';
import Queue from './Queue';
import ApiRouter from './api';

setQueues(Queue.getInstance().getQueues());

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

export default app;