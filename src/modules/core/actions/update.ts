import { UpdateStatus, UpdateStatusOrigin, UpdateStateSlice } from '../models/update';
import { StateFn } from '../models/root';

export const SET_UPDATE_STATUS = 'SET_UPDATE_STATUS';
export const RESTART_FOR_UPDATE = 'RESTART_FOR_UPDATE';
export const IGNORE_UPDATE = 'IGNORE_UPDATE';
export const CHECK_FOR_UPDATE = 'CHECK_FOR_UPDATE';

export interface SetUpdateStatus {
    type: typeof SET_UPDATE_STATUS;
    status: UpdateStatus;
    origin: UpdateStatusOrigin;
}

export type SetUpdateStatusType = SetUpdateStatus;

export type setUpdateStatusFn = (status: UpdateStatus, origin: UpdateStatusOrigin) => void;
export function setUpdateStatus(status: UpdateStatus, origin: UpdateStatusOrigin = UpdateStatusOrigin.Carry) {
    return <SetUpdateStatus>{ type: SET_UPDATE_STATUS, status, origin };
}

export interface RestartForUpdate {
    type: typeof RESTART_FOR_UPDATE;
}

export type RestartForUpdateType = RestartForUpdate;

export type restartForUpdateFn = () => void;
export function restartForUpdate() {
    return <RestartForUpdate>{ type: RESTART_FOR_UPDATE };
}

export interface IgnoreUpdate {
    type: typeof IGNORE_UPDATE;
}

export type IgnoreUpdateType = IgnoreUpdate;

export type ignoreUpdateFn = () => void;
export function ignoreUpdate() {
    return <IgnoreUpdate>{ type: IGNORE_UPDATE };
}

export interface CheckForUpdate {
    type: typeof CHECK_FOR_UPDATE;
}

export type CheckForUpdateType = CheckForUpdate;

export type checkForUpdateFn = () => void;
export function checkForUpdate() {
    return <CheckForUpdate>{ type: CHECK_FOR_UPDATE };
}

export const SET_UPDATE_SUPPORTED = 'SET_UPDATE_SUPPORTED';

export interface SetUpdateSupported {
    type: typeof SET_UPDATE_SUPPORTED;
    supported: boolean;
}

export type SetUpdateSupportedType = SetUpdateSupported;

export type setUpdateSupportedFn = (supported: boolean) => void;
export function setUpdateSupported(supported: boolean) {
    return <SetUpdateSupported>{ type: SET_UPDATE_SUPPORTED, supported };
}

export type ActionType = SetUpdateStatusType | RestartForUpdateType | IgnoreUpdateType | CheckForUpdateType | SetUpdateSupported;
