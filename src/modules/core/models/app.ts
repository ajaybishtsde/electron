export enum AppStatus {
    Error = -2,
    Disconnected = -1,
    Startup = 0,
    Ready = 1
}

export interface AppLocation {
    hash: string;
    key: string;
    pathname: string;
    search: string;
    state: any;
}

export interface AppState {
    status?: AppStatus;
    location?: AppLocation;
    err?: any;
}

export interface AppStateSlice {
    app?: AppState;
}
