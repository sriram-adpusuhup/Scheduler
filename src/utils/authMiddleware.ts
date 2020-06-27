import {Request, Response, NextFunction} from 'express';

const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn = req.session && req.session.isLoggedIn;
    if (isLoggedIn) next();
    else {
        return res.redirect('/login');
    }
}; 

export default authorizeAdmin;