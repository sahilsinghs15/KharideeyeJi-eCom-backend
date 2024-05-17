import { Request, Response, NextFunction, RequestHandler } from "express";

export interface requestAuth extends Request {
    user: { id: string };
}

const asyncHandler = (fn: (req: requestAuth, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req: Request, res: Response<any, Record<string, any>>, next: NextFunction) => {
        
        fn(req as requestAuth, res, next).catch((err) => next(err));
    };
};

export default asyncHandler;
