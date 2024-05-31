import { Writable } from "stream";

declare module "streamroller" {
    export interface RollingFileWriteStreamOptions {
        numToKeep?: number;
        intervalDays?: number;
        daysToKeep?: number;
        maxSize?: number;
        mode?: string;
        flags?: string;
        compress?: boolean;
        keepFileExt?: boolean;
        datePattern?: string;
        alwaysIncludePattern?: boolean;
    }

    export class RollingFileWriteStream extends Writable {
        constructor(filePath: string, options?: RollingFileWriteStreamOptions);
    }

    export class RollingFileStream extends RollingFileWriteStream {
        constructor(filename: string, size: number, backups: number, options?: RollingFileWriteStreamOptions);
        constructor(filename: string, size: number);
        constructor(filename: string);
    }

    export class DateRollingFileStream extends RollingFileWriteStream {
        constructor(filename: string, pattern: string, options?: RollingFileWriteStreamOptions);
        constructor(filename: string, options: RollingFileWriteStreamOptions);
        constructor(filename: string);
    }
}