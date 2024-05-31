import { LoggerNamespace } from '@log';

declare global {
    function LOG_NS(ns: string): LoggerNamespace;
    function LOG_INFO(ns: LoggerNamespace, msg: string, ...args: any[]);
    function LOG_INFO(msg: string, ...args: any[]);
    function LOG_WARN(ns: LoggerNamespace, msg: string, ...args: any[]);
    function LOG_WARN(msg: string, ...args: any[]);
    function LOG_ERROR(ns: LoggerNamespace, msg: string, ...args: any[]);
    function LOG_ERROR(msg: string, ...args: any[]);
    function LOG_DEBUG(ns: LoggerNamespace, msg: string, ...args: any[]);
    function LOG_DEBUG(msg: string, ...args: any[]);
}