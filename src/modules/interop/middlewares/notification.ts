import { toRemovable, asRemovable } from 'yggdrasil/lib/removable';
import { ipcRenderer, remote } from 'electron';
import { AppConnector, AppConnectorV1, AppConnectorV2 } from '../app-connector';
import * as NotificationActions from '@modules/core/actions/notification';
import { MiddlewareAPI } from 'redux';
import { PreferenceStateSlice, PREFERENCES } from '@modules/core/models/preference';
import { Dispatch } from 'redux';
import { NotificationStateSlice } from '@modules/core/models/notification';
import * as PreferenceActions from '@modules/core/actions/preference';
import { getPreference } from '@modules/core/selectors/preference';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:middlewares:notification`);

export const notifications = ({ connector }: { connector: AppConnector }) => (store: MiddlewareAPI<Dispatch, PreferenceStateSlice>): any => {
    let doNotDisturb = false;
    let prevMuted = getPreference(store.getState(), PREFERENCES.muted);

    connector.subscribe('/app/notification/hook', (noty) => {
        const { icon, body, subject, value, from } = noty;
        const { name } = window.ryverAppContext;

        store.dispatch(
            NotificationActions.createNotification({ icon, subject, body, source: { value, from } }, name, doNotDisturb)
        );
    });

    connector.subscribe('/app/presence/change', (presence) => {
        doNotDisturb = presence === 'dnd';
    });

    return (next: Dispatch) => (action: NotificationActions.ActionType | PreferenceActions.ActionType) => {
        switch (action.type) {
            case NotificationActions.TAKE_ACTION_ON_NOTIFICATION: {
                const res = next(action);
                const { data, organizationId } = action;
                const { name } = window.ryverAppContext;
                if ((connector).version >= 1 && data.source && organizationId === name) {
                    (connector as AppConnectorV1).navigateToSource(data.source);
                }
                return res;
            }
            case PreferenceActions.SET_PREFERENCE:
            case PreferenceActions.SET_PREFERENCES: {
                // todo: should we have interop side preference sinks?
                const res = next(action);
                const nextMuted = getPreference(store.getState(), PREFERENCES.muted);
                if ((connector.version) >= 2 && prevMuted !== nextMuted) {
                    (connector as AppConnectorV2).muteNotificationSounds(prevMuted = nextMuted);
                }
                return res;
            }

        }
        return next(action);
    };
};

export default notifications;
