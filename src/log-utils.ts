import { addColors, createLogger, format, transports, Logger as LoggerType } from 'winston';
import { Colorizer, Format, TransformableInfo, format as fmt } from 'logform';
import TransportStream from 'winston-transport';
import { INFO, LEVEL, MESSAGE } from 'triple-beam';
import * as util from 'util';

export const STYLE: any = Symbol('renderer.console.style');

export class RendererConsole extends TransportStream {
    name = 'RendererConsole';
    levelToConsoleFn = {
        error: console.error,
        warn: console.warn,
        info: console.info,
        verbose: console.debug,
        debug: console.debug,
        silly: console.debug
    }

    log(info, callback) {
        setImmediate(() => this.emit('logged', info));
        const infoStyle = info[STYLE] || [];
        const consoleFn = this.levelToConsoleFn[info[LEVEL]];
        if (consoleFn) {
            consoleFn(info[MESSAGE], ...infoStyle);
        }

        if (callback) {
            callback(); // eslint-disable-line callback-return
        }
    }
}

export type ColorizeRendererOptions = { colors?: { [level: string]: string }, all?: boolean, level?: boolean, message?: boolean };
export const colorizeRenderer = fmt((info: TransformableInfo, opts: ColorizeRendererOptions) => {
    const { level, message } = info;
        let infoStyle = [];

        if (opts.level || opts.all || !opts.message) {
            info.level = `%c${level}%c`;
            infoStyle.push(
                `color: ${opts.colors[level]}`,
                `color: inherit`
            );
        }

        if (opts.all || opts.message) {
            info.message = `%c${message || level}%c`;
            infoStyle.push(
                `color: ${opts.colors[level]}`,
                `color: inherit`
            )
        }

        if (infoStyle.length > 0) {
            info[STYLE] = infoStyle;
        }

        return info;
});

export const forward = fmt(info => info);

export const logOutputFormat = format.printf(info => {
    const { level, message, splat, namespace = 'global', timestamp, meta } = info;
    const metaObj = Array.isArray(meta)
        ? meta[0]
        : meta;

    if (metaObj) {
        return `${timestamp} [${level}] ${namespace} - ${message} - ${util.inspect(metaObj, false, 1)}`
    } else {
        return `${timestamp} [${level}] ${namespace} - ${message}`
    }
});

export const uncolorizeMsg = (msg: string) => msg ? msg.replace(/(^|[^%])%c/g, '$1') : msg;
