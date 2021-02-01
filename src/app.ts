import express, {Request, Response} from 'express';
import {setQueues, UI} from 'bull-board';
import session from 'express-session';
import {randomBytes, createHash} from 'crypto';
import * as dotenv from 'dotenv';

import Queue from './core/Queue';
import ApiRouter from './routes/api';
import globalErrorHandler from './globalErrorHandler';
import authorizeAdmin from './utils/authMiddleware';

dotenv.config();

const ONE_HOUR = 60 * 60 * 1000;
const {
    SESSION_SECRET = '28hwgasjd',
    COOKIE_MAX_AGE = ONE_HOUR,
    NODE_ENV,
    SESSION_NAME = 'sid',
    ADMIN_USERNAME = 'admin',
    ADMIN_PASSWORD_HASH = '9ad0a735497565363d76181b6d042f62'
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

// Inform Bull UI about our existing Queues.
setQueues(Queue.getInstance().getQueues());

// process.on('unhandledRejection', (e: Error) => {
//     console.error(e.message);
//     console.log(e.stack);
//     process.exit(1);
// })

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(session({
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: (_: Request): string => {
        return randomBytes(4).toString('hex');
    },
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: IS_PRODUCTION,
        maxAge: typeof COOKIE_MAX_AGE === 'string' ? parseInt(COOKIE_MAX_AGE) : COOKIE_MAX_AGE
    }
}))

// Setting up pug for UI
app.set('view engine', 'pug');

// Serving Static files
app.use(express.static('public'));
app.use(express.static('views'));

app.get('/',authorizeAdmin, (req: Request, res: Response) => {
    return res.redirect('/admin')
});

app.route('/login')
    .get((req: Request, res: Response) => {
        if (req.session && req.session['isLoggedIn']) 
            return res.redirect('/admin');
        else return res.render('login');
    })
    .post((req: Request, res: Response) => {
        const {username, password} = req.body || {};
        const currentPasswordHash = createHash('md5').update(password).digest('hex');
        console.log({ currentPasswordHash, admin: ADMIN_PASSWORD_HASH });
        if (username !== ADMIN_USERNAME || currentPasswordHash !== ADMIN_PASSWORD_HASH) {
            return res.render('login', {error: 'Invalid Credentials'});
        }
        req.session && (req.session['isLoggedIn'] = true);
        return res.redirect('/');
    });


// access queue monitoring UI at /admin
app.use('/admin', authorizeAdmin, UI);

// init api routes
ApiRouter.initRoutes(app);

app.use(globalErrorHandler);

export default app;