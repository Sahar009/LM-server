import { Request, Response, NextFunction } from 'express';

export const CatchAsyncError = (theFunc: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(theFunc(req, res, next)).catch(next);
    };
};