interface NotificationOptions {
    dir?: string;
    lang?: string;
    body?: string;
    tag?: string;
    icon?: string;
    data?: any;
    vibrate?: number[];
    renotify?: boolean;
    silent?: boolean;
    sound?: string;
    noscreen?: boolean;
    sticky?: boolean;
    requireInteraction?: boolean;
}

interface Notification {
    title: string;
    dir: string;
    lang: string;
    body: string;
    tag: string;
    icon: string;
    data: any;
    silent: boolean;
    timestamp: number;
    noscreen: boolean;
    renotify: boolean;
    sound: string;
    sticky: boolean;
    vibrate: number[];
    onclick: Function;
    onerror: Function;
    onclose: Function;
    close(): void;
}

declare var Notification: {
    prototype: Notification;
    permission: string;
    new(title: string, options?: NotificationOptions): Notification;
    requestPermission(): Promise<string>;
}