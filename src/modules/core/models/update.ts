export enum UpdateStatus {
    Error = 0,
    NoUpdate,
    Check,
    Fetch,
    Ready,
    Ignore
}

export enum UpdateStatusOrigin {
    Carry = 0,
    System,
    User
}

export interface UpdateState {
    status?: UpdateStatus;
    origin?: UpdateStatusOrigin;
    supported?: boolean;
}

export interface UpdateStateSlice {
    update?: UpdateState;
}
