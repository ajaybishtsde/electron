import { Reducer } from 'redux';

import * as UpdateActions from '../actions/update';
import { UpdateState, UpdateStatus, UpdateStatusOrigin } from '../models/update';

const DEFAULT: UpdateState = Object.freeze(<UpdateState>{
    status: UpdateStatus.NoUpdate,
    origin: UpdateStatusOrigin.System,
    supported: false
});

export const reduce: Reducer<UpdateState> = (prevState: UpdateState = DEFAULT, action: UpdateActions.ActionType) => {
    switch (action.type) {
        case UpdateActions.CHECK_FOR_UPDATE:
            return {
                ...prevState
            };
        case UpdateActions.IGNORE_UPDATE:
            return {
                ...prevState,
                status: UpdateStatus.Ignore,
                origin: UpdateStatusOrigin.User
            };
        case UpdateActions.RESTART_FOR_UPDATE:
            return {
                ...prevState
            };
        case UpdateActions.SET_UPDATE_STATUS:
            return {
                ...prevState,
                status: action.status,
                origin: action.origin > UpdateStatusOrigin.Carry ? action.origin : prevState.origin
            };
        case UpdateActions.SET_UPDATE_SUPPORTED:
            return {
                ...prevState,
                supported: action.supported
            };
    }
    return prevState;
};

export default reduce;
