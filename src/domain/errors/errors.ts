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

export class InvalidCategoryException extends Error {
    public readonly name: string = 'Invalid Category Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidCategoryException.prototype);
    }
}

export class InvalidFileException extends Error {
    public readonly name: string = 'Invalid File Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidFileException.prototype);
    }
}

export class InvalidRegisterException extends Error {
    public readonly name: string = 'Invalid Register Error';

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidRegisterException.prototype);
    }
}