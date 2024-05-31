import { DidFailLoadEvent, PluginCrashedEvent } from 'electron';

export enum Status {
    Setup = 0,
    Loading = 1,
    Loaded = 2
}

export class DidFailLoadError {
    errorCode: number;
    errorDescription: string;
    validatedURL: string;
    isMainFrame: boolean;

    constructor(errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean) {
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.validatedURL = validatedURL;
        this.isMainFrame = isMainFrame;
    }

    static from(evt: DidFailLoadEvent): DidFailLoadError {
        return new DidFailLoadError(evt.errorCode, evt.errorDescription, evt.validatedURL, evt.isMainFrame);
    }
}

export class CrashError {

}

export class GpuCrashError {

}

export class PluginCrashError {
    name: string;
    version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    static from(evt: PluginCrashedEvent): PluginCrashError {
        return new PluginCrashError(evt.name, evt.version);
    }
}

import * as NET_ERROR from '../../../../../net-error-list';

export const NET_ERROR_TO_ERROR_MESSAGE: {
    [code: number]: {
        subject?: string;
        body?: string;
        code?: string;
    }
} = {
    ...Object.entries(NET_ERROR).reduce((res, [label, code]) => (
        res[code] = {
            subject: i18n`Something went wrong trying to open the organization.`,
            code: `${label}`
        },
        res
    ), {}),
    /* todo: create more expanded error messages */
    [0]: {
        subject: i18n`Something went wrong trying to open the organization.`,
        code: `UNKNOWN`
    },
    [-106]: {
        subject: i18n`Could not open the organization.`,
        body: i18n`There seems to be an issue with your network connection.`,
        code: `INTERNET_DISCONNECTED`
    },
    [-102]: {
        subject: i18n`Could not open the organization.`,
        body: i18n`There may be an issue with our servers.`,
        code: `CONNECTION_REFUSED`
    }
};
