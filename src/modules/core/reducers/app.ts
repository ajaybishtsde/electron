import { Reducer } from 'redux';

import { AppStatus, AppState } from '../models/app';

export type State = AppState;

export const DEFAULT: AppState = Object.freeze({
    status: AppStatus.Ready,
    err: void 0
});

export type ActionType = any;

export const reduce: Reducer<AppState> = (prevState: AppState = DEFAULT, action: ActionType) => {
    switch (action.type) {

    }
    return prevState;
};

export default reduce;
