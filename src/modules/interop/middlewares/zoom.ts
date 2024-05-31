import { on, once } from 'yggdrasil/lib/event';
import { remote } from 'electron';
import * as PreferenceActions from '@modules/core/actions/preference';
import { MiddlewareAPI } from 'redux';
import { PreferenceStateSlice, PREFERENCES } from '@modules/core/models/preference';
import { Dispatch } from 'redux';
import { getPreference } from '@modules/core/selectors/preference';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:middlewares:zoom`);

export const zoom = () => (store: MiddlewareAPI<Dispatch, PreferenceStateSlice>): any => {
    let prevZoomLevel = getPreference(store.getState(), PREFERENCES.zoomLevel);

    once(document, 'DOMContentLoaded', () => setZoomLevel(prevZoomLevel));

    return (next: Dispatch) => (action: PreferenceActions.ActionType) => {
        switch (action.type) {
            case PreferenceActions.SET_PREFERENCE:
            case PreferenceActions.SET_PREFERENCES: {
                // todo: should we have interop side preference sinks?
                const res = next(action);
                const nextZoomLevel = getPreference(store.getState(), PREFERENCES.zoomLevel);
                if (prevZoomLevel !== nextZoomLevel) {
                    setZoomLevel(prevZoomLevel = nextZoomLevel);
                }
                return res;
            }
        }
        return next(action);
    };
};

const setZoomLevel = (zoomLevel: number) => {
    /**
     * NOTE: It should be as simple as:
     * ```
     * remote.getCurrentWebContents().setZoomLevel(prevZoomLevel = nextZoomLevel);
     * ```
     * ...but that is broken: https://github.com/electron/electron/issues/7375
     */
    const zoomFactor = Math.pow(1.2, zoomLevel);

    document.documentElement.style.zoom = `${zoomFactor}`;

    setImmediate(() => window.dispatchEvent(new Event('resize')));
};

export default zoom;
