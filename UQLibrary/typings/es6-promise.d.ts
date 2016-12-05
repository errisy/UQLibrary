/**
 * polyfill for IE11, because IE11 does not support Promise type.
 */
declare module ES6Promise {
    /**
     * Enable the support of Promise in IE11.
     */
    export function polyfill(): void;
}