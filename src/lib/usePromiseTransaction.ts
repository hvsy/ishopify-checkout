import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

/**
 * Base transaction error
 */
export class PromiseTransactionError extends Error {
    readonly code: string;

    constructor(
        code: string,
        message: string,
    ) {
        super(message);

        this.name = 'PromiseTransactionError';
        this.code = code;

        // Make instanceof reliable for transpiled environments.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Transaction timeout.
 */
export class PromiseTransactionTimeoutError
    extends PromiseTransactionError {
    constructor(
        message = 'Transaction timed out',
    ) {
        super(
            'TRANSACTION_TIMEOUT',
            message,
        );

        this.name =
            'PromiseTransactionTimeoutError';
    }
}

/**
 * Transaction cancelled.
 */
export class PromiseTransactionCancelledError
    extends PromiseTransactionError {
    constructor(
        message = 'Transaction cancelled',
    ) {
        super(
            'TRANSACTION_CANCELLED',
            message,
        );

        this.name =
            'PromiseTransactionCancelledError';
    }
}

/**
 * begin() was called while another
 * transaction is still active.
 */
export class PromiseTransactionAlreadyActiveError
    extends PromiseTransactionError {
    constructor() {
        super(
            'TRANSACTION_ALREADY_ACTIVE',
            'A transaction is already active',
        );

        this.name =
            'PromiseTransactionAlreadyActiveError';
    }
}

/**
 * Options
 */
export interface UsePromiseTransactionOptions {
    /**
     * Maximum transaction duration.
     *
     * undefined / 0 = no timeout.
     *
     * Example:
     * 120_000 = 120 seconds
     */
    timeout?: number;

    /**
     * Automatically reject the transaction
     * when component unmounts.
     *
     * Default: true
     */
    rejectOnUnmount?: boolean;
}

/**
 * Public API
 */
export interface PromiseTransaction<T> {
    /**
     * Start a transaction.
     *
     * The returned Promise will be resolved/rejected
     * by resolve() / reject().
     */
    begin(): Promise<T>;

    /**
     * Execute an operation and wait for an external
     * callback to resolve/reject the transaction.
     */
    execute<R>(
        operation: () => Promise<R> | R,
    ): Promise<T>;

    /**
     * Resolve current transaction.
     */
    resolve(value: T): void;

    /**
     * Reject current transaction.
     */
    reject(error: unknown): void;

    /**
     * Cancel current transaction.
     */
    cancel(reason?: unknown): void;

    /**
     * Whether a transaction is currently active.
     */
    readonly isActive: boolean;

    /**
     * Current transaction ID.
     */
    readonly transactionId: string | null;

    /**
     * Current transaction Promise.
     */
    readonly promise: Promise<T> | null;
}

/**
 * Generic Promise Transaction Hook
 */
export function usePromiseTransaction<T>(
    options: UsePromiseTransactionOptions = {},
): PromiseTransaction<T> {
    const {
        timeout = 0,
        rejectOnUnmount = true,
    } = options;

    /**
     * React state
     *
     * These are only for UI / observation.
     * The actual transaction state lives in refs.
     */
    const [isActive, setIsActive] =
        useState(false);

    const [transactionId, setTransactionId] =
        useState<string | null>(null);

    /**
     * Current transaction promise.
     */
    const promiseRef =
        useRef<Promise<T> | null>(null);

    /**
     * Promise resolve/reject functions.
     */
    const resolveRef =
        useRef<((value: T) => void) | null>(null);

    const rejectRef =
        useRef<
            ((reason?: unknown) => void) | null
        >(null);

    /**
     * Timeout timer.
     */
    const timeoutRef =
        useRef<ReturnType<typeof setTimeout> | null>(
            null,
        );

    /**
     * Transaction ID.
     */
    const transactionIdRef =
        useRef<string | null>(null);

    /**
     * Whether current transaction has already
     * been settled.
     */
    const settledRef =
        useRef(false);

    /**
     * Generate transaction ID.
     *
     * crypto.randomUUID() is preferred,
     * but fallback is useful in some test
     * environments.
     */
    const createTransactionId =
        useCallback(() => {
            if (
                typeof crypto !== 'undefined' &&
                typeof crypto.randomUUID === 'function'
            ) {
                return crypto.randomUUID();
            }

            return `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;
        }, []);

    /**
     * Clear timeout.
     */
    const clearTransactionTimeout =
        useCallback(() => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);

                timeoutRef.current = null;
            }
        }, []);

    /**
     * Cleanup internal state.
     *
     * IMPORTANT:
     * This does not resolve/reject the Promise.
     * The caller must settle it first.
     */
    const cleanup =
        useCallback(() => {
            clearTransactionTimeout();

            promiseRef.current = null;
            resolveRef.current = null;
            rejectRef.current = null;

            transactionIdRef.current = null;

            settledRef.current = false;

            setIsActive(false);
            setTransactionId(null);
        }, [clearTransactionTimeout]);

    /**
     * Start a transaction.
     */
    const begin =
        useCallback((): Promise<T> => {
            /**
             * Prevent concurrent transactions.
             */
            if (promiseRef.current !== null) {
                throw new PromiseTransactionAlreadyActiveError();
            }

            const id = createTransactionId();

            let resolvePromise!: (
                value: T,
            ) => void;

            let rejectPromise!: (
                reason?: unknown,
            ) => void;

            const promise = new Promise<T>(
                (resolve, reject) => {
                    resolvePromise = resolve;
                    rejectPromise = reject;
                },
            );

            promiseRef.current = promise;

            resolveRef.current =
                resolvePromise;

            rejectRef.current =
                rejectPromise;

            transactionIdRef.current = id;

            settledRef.current = false;

            setIsActive(true);
            setTransactionId(id);

            /**
             * Setup timeout.
             */
            if (timeout > 0) {
                timeoutRef.current =
                    setTimeout(() => {
                        if (settledRef.current) {
                            return;
                        }

                        const rejecter =
                            rejectRef.current;

                        if (!rejecter) {
                            return;
                        }

                        settledRef.current = true;

                        cleanup();

                        rejecter(
                            new PromiseTransactionTimeoutError(
                                `Transaction timed out after ${timeout}ms`,
                            ),
                        );
                    }, timeout);
            }

            return promise;
        }, [
            cleanup,
            createTransactionId,
            timeout,
        ]);

    /**
     * Resolve transaction.
     */
    const resolve =
        useCallback(
            (value: T) => {
                if (settledRef.current) {
                    return;
                }

                const resolver =
                    resolveRef.current;

                if (!resolver) {
                    return;
                }

                settledRef.current = true;

                cleanup();

                resolver(value);
            },
            [cleanup],
        );

    /**
     * Reject transaction.
     */
    const reject =
        useCallback(
            (error: unknown) => {
                if (settledRef.current) {
                    return;
                }

                const rejecter =
                    rejectRef.current;

                if (!rejecter) {
                    return;
                }

                settledRef.current = true;

                cleanup();

                rejecter(error);
            },
            [cleanup],
        );

    /**
     * Cancel transaction.
     */
    const cancel =
        useCallback(
            (reason?: unknown) => {
                if (settledRef.current) {
                    return;
                }

                const error =
                    reason ??
                    new PromiseTransactionCancelledError();

                reject(error);
            },
            [reject],
        );

    /**
     * Execute an operation and wait for
     * external resolve/reject.
     *
     * Example:
     *
     * await transaction.execute(
     *   () => cardFields.submit(),
     * );
     *
     * The operation itself doesn't resolve
     * the transaction.
     *
     * An external callback should call:
     *
     * transaction.resolve(...)
     *
     * or:
     *
     * transaction.reject(...)
     */
    const execute =
        useCallback(
            async <R>(
                operation: () =>
                    | Promise<R>
                    | R,
            ): Promise<T> => {
                const transactionPromise =
                    begin();

                const operationPromise =
                    Promise.resolve().then(operation);

                try {
                    /**
                     * 外部回调可能在 operation 尚未 settle 时先 resolve/reject。
                     * race 让外部先完成时也能立即结束 transaction，
                     * 避免 onError 等回调只 reject transaction、却仍等待 SDK Promise 的情况。
                     */
                    return await Promise.race([
                        operationPromise.then(
                            () => transactionPromise,
                        ),
                        transactionPromise,
                    ]);
                } catch (error) {
                    reject(error);

                    throw error;
                }
            },
            [begin, reject],
        );

    /**
     * Cancel active transaction when
     * component unmounts.
     */
    useEffect(() => {
        return () => {
            if (!rejectOnUnmount) {
                cleanup();

                return;
            }

            if (
                promiseRef.current === null ||
                settledRef.current
            ) {
                return;
            }

            const rejecter =
                rejectRef.current;

            if (!rejecter) {
                return;
            }

            settledRef.current = true;

            clearTransactionTimeout();

            /**
             * Clear refs without calling setState,
             * because the component is unmounting.
             */
            promiseRef.current = null;
            resolveRef.current = null;
            rejectRef.current = null;
            transactionIdRef.current = null;

            rejecter(
                new PromiseTransactionCancelledError(
                    'Transaction cancelled because the component was unmounted',
                ),
            );
        };
    }, [
        cleanup,
        clearTransactionTimeout,
        rejectOnUnmount,
    ]);

    return {
        begin,
        execute,
        resolve,
        reject,
        cancel,
        isActive,
        transactionId,
        promise: promiseRef.current,
    };
}
