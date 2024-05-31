
import { debounce } from 'yggdrasil/lib/lang';
import { on } from 'yggdrasil/lib/event';
import { isWin, isWin8 } from '../../../os-detection';
import { ipcRenderer, remote } from 'electron';
import { AppConnector } from '../app-connector';
import { MiddlewareAPI } from 'redux';
import { PreferenceStateSlice, PREFERENCES } from '@modules/core/models/preference';
import * as PreferenceActions from '@modules/core/actions/preference';
import { Dispatch } from 'redux';
import { getPreference } from '@modules/core/selectors/preference';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:middlewares:app-feature`);

export const appFeatures = ({ connector }: { connector: AppConnector }) => (store: MiddlewareAPI<Dispatch, PreferenceStateSlice>): any => {
    const prevUsePhoneMode = getPreference(store.getState(), PREFERENCES.usePhoneMode);

    debug('features usePhoneMode=', prevUsePhoneMode, store.getState());
    connector.features.update('ryver-phone', prevUsePhoneMode, true, true);
    connector.features.update('ryver-standard', !prevUsePhoneMode, true, true);

    return (next: Dispatch) => (action: PreferenceActions.ActionType) => {
        switch (action.type) {
            case PreferenceActions.SET_PREFERENCE:
            case PreferenceActions.SET_PREFERENCES: {
                // todo: should we have interop side preference sinks?
                const res = next(action);
                const nextUsePhoneMode = getPreference(store.getState(), PREFERENCES.usePhoneMode);

                let isReloadRequired = false;

                if (prevUsePhoneMode !== nextUsePhoneMode) {
                    isReloadRequired = true;
                }

                if (isReloadRequired) {
                    const webConents = remote.getCurrentWebContents();
                    if (webConents) {
                        webConents.reload();
                    }
                }

                return res;
            }
        }
        return next(action);
    };
};

export default appFeatures;
