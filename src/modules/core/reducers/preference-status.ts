import { Reducer } from 'redux';

import * as PreferenceActions from '../actions/preference';
import * as OrganizationActions from '../actions/organization';
import { PreferenceState, PREFERENCES, PreferenceStatusState } from '../models/preference';
import { clone, mixin } from 'yggdrasil/lib/lang';

export const DEFAULT: {[P in keyof Partial<PreferenceState>]: boolean} = Object.keys(PREFERENCES).reduce((r, k) => {
    return (r[k] = true), r;
}, {});

export const reduce: Reducer<PreferenceStatusState> = (prevState: PreferenceStatusState = DEFAULT, action: PreferenceActions.ActionType) => {
    switch (action.type) {
        case PreferenceActions.SET_PREFERENCES_STATUS: {
            return {
                ...prevState,
                ...action.statuses
            };
        }
    }
    return prevState;
};

export default reduce;
