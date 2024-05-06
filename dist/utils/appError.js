class appError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default appError;
