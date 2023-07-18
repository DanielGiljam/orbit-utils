import {Exception} from "@orbit/core";

/**
 * An error occurred when communicating with an other thread using `postMessage`.
 */
export class MessageException extends Exception {
    public data: unknown;

    constructor(message: string, data?: unknown) {
        super(`Message exception: ${message}`);
        this.data = data;
    }
}

/**
 * Caught something which doesn't extend `Error`.
 */
export class UnknownException extends Exception {
    public cause: unknown;

    constructor(cause: unknown) {
        super(`Unknown exception.`);
        this.cause = cause;
    }
}
