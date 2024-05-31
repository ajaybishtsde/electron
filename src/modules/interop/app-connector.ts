import { Removable } from 'yggdrasil/lib/removable';

export interface AppFeatures {
    has(name: string): any;
    update(name: string, valueOrTest: (() => any) | any, replace?: boolean, immediate?: boolean): any;
}

export interface AppConnectorV0 {
    version: 0;
    features: AppFeatures;
    publish(name: string, ...args: any[]): void;
    subscribe(name: string, fn: (...args: any[]) => void): Removable;
    setPresence(name: string);
    setIsVisible(value: boolean);
}

export interface AppConnectorV1 {
    version: 1;
    features: AppFeatures;
    publish(name: string, ...args: any[]): void;
    subscribe(name: string, fn: (...args: any[]) => void): Removable;
    setPresence(name: string);
    setIsVisible(value: boolean);
    navigateToSource(source: any);
}

export interface AppConnectorV2 {
    version: 2;
    features: AppFeatures;
    publish(name: string, ...args: any[]): void;
    subscribe(name: string, fn: (...args: any[]) => void): Removable;
    setPresence(name: string);
    setIsVisible(value: boolean);
    navigateToSource(source: any);
    muteNotificationSounds(mute: boolean);
}

export type AppConnector = AppConnectorV0 | AppConnectorV1 | AppConnectorV2;
