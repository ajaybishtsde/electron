import * as path from 'path';
import * as fs from 'fs-plus';
import { clone, mixin } from 'yggdrasil/lib/lang';
import { BrowserWindow, app, remote } from 'electron';
import { MiddlewareAPI, StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import { PreferenceStateSlice, PreferenceState, PreferenceChangeSink } from '@modules/core/models/preference';
import * as PreferenceActions from '@modules/core/actions/preference';
import { createStartupShortcut, removeStartupShortcut, isShortcutCreationSupported } from '../installers/win32';
import { DEFAULT as PREFERENCES } from '@modules/core/reducers/preference';
import { ensureUpToDate } from '../upgrade/preferences';
import { getPreference, getPreferences } from '@modules/core/selectors/preference';

export const AVAILABLE_RULES: {[P in keyof Partial<PreferenceState>]: () => boolean} = {
    openOnStart: () => isShortcutCreationSupported(),
    dockBounceMode: () => process.platform === 'darwin'
};

export const CHANGE_HOOKS: PreferenceChangeSink = {
    openOnStart: (openOnStart) => {
        if (process.platform === 'win32' && process.type === 'browser') {
            if (openOnStart) {
                createStartupShortcut();
            } else {
                removeStartupShortcut();
            }
        }
    }
};

const execChangeHook = <P extends keyof PreferenceState>(key: P, prevValue: PreferenceState[P], nextValue: PreferenceState[P]) => {
    const fn = CHANGE_HOOKS[key] as Function; // todo: typescript is detecting type wrong as of 2.7.1
    if (fn) {
        LOG_DEBUG('exec change hook for %s: prev=%j, next=%j', key, prevValue, nextValue);
    }
    if (fn && prevValue !== nextValue) {
        fn(nextValue);
    }
};

const execChangeHooks = <P extends keyof PreferenceState>(prevValues: Partial<PreferenceState>, nextValues: Partial<PreferenceState>) => {
    Object.keys(nextValues).forEach((key: P) => execChangeHook(key, prevValues[key], nextValues[key]));
};

export const preferenceSink = () => (store: MiddlewareAPI<Dispatch, PreferenceStateSlice>): any => {
    setImmediate(() => {
        const statuses: {[P in keyof Partial<PreferenceState>]: boolean} = Object.keys(PREFERENCES).reduce((r, k) => {
            return (r[k] = AVAILABLE_RULES[k] ? AVAILABLE_RULES[k]() : true), r;
        }, {});
        store.dispatch(PreferenceActions.setPreferencesStatus(statuses));
    });

    return (next: Dispatch) => (action: PreferenceActions.ActionType) => {
        switch (action.type) {
            case PreferenceActions.SET_PREFERENCE: {
                const prevValue = getPreference(store.getState(), action.key);
                const res = next(action);
                execChangeHook(action.key, prevValue, action.value);
                return res;
            }
            case PreferenceActions.SET_PREFERENCES: {
                const prevValues = getPreferences(store.getState());
                const res = next(action);
                execChangeHooks(prevValues, action.values);
                return res;
            }
        }
        return next(action);
    };
};

export default preferenceSink;
