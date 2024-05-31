import { UpdateChannel } from '@modules/core/models/update';

export interface ApplicationOptions {
    newInstance?: boolean;
    noProxy?: boolean;
    resourcePath?: string;
    updateChannel?: UpdateChannel;
    logLevel?: string;
}

export interface Disposable {
    dispose();
}
