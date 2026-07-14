export class NotFoundException extends Error {
    public readonly name: string = 'Internal Error';
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
}

export class DatabaseException extends Error {
    public readonly name: string = 'Database Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, DatabaseException.prototype);
    }
}

export class UserAlreadyExistsException extends Error {
    public readonly name: string = 'User Already Exists Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UserAlreadyExistsException.prototype);
    }
}

export class InvalidCredentialsException extends Error {
    public readonly name: string = 'Invalid Credentials Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidCredentialsException.prototype);
    }
}
export class MessageQueueException extends Error {
    public readonly name: string = 'Message Queue Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, MessageQueueException.prototype);
    }
}
export class QueueProcessingException extends Error {
    public readonly name: string = 'Queue Processing Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, QueueProcessingException.prototype);
    }
}

export class EmailSendException extends Error {
    public readonly name: string = 'Email Send Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, EmailSendException.prototype);
    }
}

export class InvalidDueDateException extends Error {
    public readonly name: string = 'Invalid due date';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidDueDateException.prototype);
    }
}

export class CronJobException extends Error {
    public readonly name: string = 'Cron job error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CronJobException.prototype);
    }
}