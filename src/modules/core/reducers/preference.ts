import { Reducer } from 'redux';

import * as PreferenceActions from '../actions/preference';
import * as OrganizationActions from '../actions/organization';
import { PreferenceState, DockBounceMode } from '../models/preference';
import { clone, mixin } from 'yggdrasil/lib/lang';

export const DEFAULT: PreferenceState = Object.freeze({
    version: 1,
    organization: void 0,
    organizations: [],
    minimizeOnClose: true,
    openOnStart: false,
    windowBounds: {
        width: 1280,
        height: 1024,
        x: void 0,
        y: void 0,
        fullscreen: false,
        maximized: false
    },
    muted: false,
    isOrganizationBarOpen: true,
    isOrganizationBarCompact: true,
    isOrganizationBarShown: true,
    isOrganizationBarInChangeMode: false,
    noSpellCheck: false,
    noProxyServer: false,
    usePhoneMode: false,
    dockBounceMode: DockBounceMode.Critical,
    zoomLevel: 0,
    updateChannel: void 0
});

export const reduce: Reducer<PreferenceState> = (prevState: PreferenceState = DEFAULT, action: PreferenceActions.ActionType | OrganizationActions.ActionType) => {
    switch (action.type) {
        case PreferenceActions.SET_PREFERENCE:
            return {
                ...prevState,
                [action.key]: action.value
            };
        case PreferenceActions.SET_PREFERENCES:
            return {
                ...prevState,
                ...action.values
            };
    }
    return prevState;
};

export default reduce;
