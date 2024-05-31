import { addColors, createLogger, format, transports, Logger as LoggerType, LogEntry } from 'winston';
import { Colorizer, Format, TransformableInfo } from 'logform';
import TransportStream from 'winston-transport';
import { INFO, LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import * as util from 'util';
import * as path from 'path';
import { app, remote } from 'electron';
import * as pkgJson from '../package.json';
import * as fs from 'fs-plus';
import { EOL } from 'os';
import * as RotateLogStream from 'rotatelog-stream';
import { center } from './ascii';
import { RendererConsole, logOutputFormat, colorizeRenderer, forward, uncolorizeMsg } from './log-utils';
import { ensureDirExists } from './util';

export enum LogLevel {
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Verbose = 'verbose',
    Debug = 'debug',
    Silly = 'silly'
}

// cannot use `app.getPath('userData')` here.  depending on when it is called, it may be `~/AppData/Roaming/Electron` vs. `~/AppData/Roaming/Ryver`.
const LOG_PATH = path.resolve((app || remote.app).getPath('appData'), pkgJson.productName, 'logs');
const LOG_TYPE = process.type === 'browser' ? 'browser' : process.guestInstanceId > 0 ? 'guest' : 'renderer';

/* ensure RYVER_LOG_LEVEL is set as this will propagate to other processes */
process.env.RYVER_LOG_LEVEL = process.env.RYVER_LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? LogLevel.Debug : LogLevel.Info);

export class LoggerNamespace {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export interface LogFn {
    (msg: string, ...args: any[]): void;
    (ns: LoggerNamespace, msg: string, ...args: any[]): void;
    (...args): void;
}

export interface LoggerOptions {
    name?: string;
    useConsole?: boolean;
}

export class Logger {
    private api: LoggerType;

    constructor(options: LoggerOptions = {}) {
        ensureDirExists(LOG_PATH);

        const {
            name = LOG_TYPE,
            useConsole = true
        } = options;

        const use = [];

        if (useConsole) {
            use.push(
                LOG_TYPE === 'browser'
                    ? new transports.Console({
                        format: format.combine(
                            format.splat(),
                            format.timestamp(),
                            format.colorize({
                                colors: {
                                    error: 'bold red',
                                    warn: 'bold yellow',
                                    info: 'bold green',
                                    verbose: 'bold cyan',
                                    debug: 'bold cyan',
                                    silly: 'bold magenta'
                                }
                            }),
                            logOutputFormat
                        )
                    })
                    : new RendererConsole({
                        format: format.combine(
                            format.splat(),
                            format.timestamp(),
                            LOG_TYPE !== 'guest'
                                ? colorizeRenderer({
                                    colors: {
                                        error: '#F44336',
                                        warn: '#FFC107',
                                        info: '#2196F3',
                                        verbose: '#00BCD4',
                                        debug: '#2196F3',
                                        silly: '#E91E63'
                                    }
                                }) : forward(),
                            logOutputFormat
                        )
                    })
            )
        }

        if (LOG_TYPE !== 'guest') {
            use.push(
                // note: this currently does not work, it will stop logging when it needs to roll over.
                /*
                new transports.File({
                    filename: path.resolve(LOG_PATH, `${name}.log`),
                    tailable: true,
                    eol: EOL,
                    maxsize: 6 * 1024, //5 * 1024 * 1024,
                    maxFiles: 3,
                    format: format.combine(
                        format.splat(),
                        format.timestamp(),
                        logOutputFormat
                    )
                }),
                */
                // note: this works, but is not tailable.  better than nothing though.
                new transports.Stream({
                    stream: new RotateLogStream(path.resolve(LOG_PATH, `${name}.log`), { maxsize: 5 * 1024 * 1024, keep: 3 }),
                    eol: EOL,
                    format: format.combine(
                        format.splat(),
                        format.timestamp(),
                        logOutputFormat
                    )
                }),
            );
        }

        this.api = createLogger({
            level: process.env.RYVER_LOG_LEVEL,
            transports: use
        });

        this.api.on('error', (err) => {
            console.error('winston error', err);
        });

        if (LOG_TYPE === 'browser') {
            this.logStartupMessage();
        }
    }

    private logStartupMessage() {
        const banner = `
██████╗ ██╗   ██╗██╗   ██╗███████╗██████╗
██╔══██╗╚██╗ ██╔╝██║   ██║██╔════╝██╔══██╗
██████╔╝ ╚████╔╝ ██║   ██║█████╗  ██████╔╝
██╔══██╗  ╚██╔╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║  ██║   ██║    ╚████╔╝ ███████╗██║  ██║
╚═╝  ╚═╝   ╚═╝     ╚═══╝  ╚══════╝╚═╝  ╚═╝
${pkgJson.version} beta - ${pkgJson.versionName}
`;
        this.info(EOL + [
            ``,
            `┌──────────────────────────────────────────────────┐`,
            ...banner.split(/\r?\n/)
                .map(text => '│' + center(text, 50) + '│'),
            `└──────────────────────────────────────────────────┘`,
            ``
        ].map(text => center(text, 79)).join(EOL));
    }

    setLogLevel = (logLevel: string) => {
        this.api.level = logLevel;
    }

    log = this.makeLevelFn();
    info = this.makeLevelFn(LogLevel.Info);
    warn = this.makeLevelFn(LogLevel.Warn);
    error = this.makeLevelFn(LogLevel.Error);
    debug = this.makeLevelFn(LogLevel.Debug);

    private makeLevelFn(logLevel?: string): LogFn {
        return (...args) => {
            let namespace: LoggerNamespace;
            let level: string = logLevel;
            let message: string;
            let meta: any;
            let splat: any[];

            if (args[0] instanceof LoggerNamespace) {
                logLevel ? [namespace, message, ...splat] = args : [namespace, level, message, ...splat] = args;
            } else {
                logLevel ? [message, ...splat] = args : [level, message, ...splat] = args;
            }

            meta = splat.length > 0 && typeof splat[splat.length - 1] === 'object' ? splat[splat.length - 1] : null;
            splat = meta ? splat.slice(0, -1) : splat;

            if (LOG_TYPE === 'guest') {
                // we need to pre-format the message due to https://github.com/electron/electron/issues/8090
                message = util.format(message, ...splat);
                splat = [];
            }

            this.api.log({
                level,
                message,
                [SPLAT]: splat,
                namespace: namespace ? namespace.name : void 0,
                meta
            });
        }
    }
}

export const logger = new Logger();

export default logger;

export const LOG_NS = (ns: string): LoggerNamespace => {
    return new LoggerNamespace(ns);
}

export const LOG_INFO: LogFn = (...args) => {
    logger.info(...args);
}

export const LOG_WARN = (...args) => {
    logger.warn(...args);
}

export const LOG_ERROR = (...args) => {
    logger.error(...args);
}

export const LOG_DEBUG = (...args) => {
    logger.debug(...args);
}

export function setLogLevel(logLevel: string) {
    logger.setLogLevel(logLevel);
}
