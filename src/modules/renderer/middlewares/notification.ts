import { MiddlewareAPI, StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import { NotificationStateSlice } from '@modules/core/models/notification';
import { OrganizationStateSlice } from '@modules/core/models/organization';
import * as NotificationActions from '@modules/core/actions/notification';
import * as OrganizationActions from '@modules/core/actions/organization';
import { isLessThanWin8, isMac, isWin, isLinux, isWin8 } from '../../../os-detection';
import { getPreferences } from '@modules/core/selectors/preference';
import { app, remote, ipcRenderer } from 'electron';
import { getSelectedOrganizationName } from '@modules/core/selectors/organization';
import { clamp } from 'yggdrasil/lib/string';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:enhancers:notification`);

// todo: something wrong with enhancer types
export const notification = () => (store: MiddlewareAPI<Dispatch, NotificationStateSlice & OrganizationStateSlice>): any => {
    return (next: Dispatch) => (action: NotificationActions.ActionType | OrganizationActions.ActionType) => {
        switch (action.type) {
            case NotificationActions.CREATE_NOTIFICATION: {
                const res = next(action);

                const browserWindow = remote.getCurrentWindow();
                const isBrowserWindowVisible = browserWindow.isVisible() && browserWindow.isFocused() && !browserWindow.isMinimized();
                const isOrganizationSelected = getSelectedOrganizationName(store.getState()) === action.organizationId;

                if (isBrowserWindowVisible && isOrganizationSelected) {
                    debug('not incrementing badge=', isBrowserWindowVisible, isOrganizationSelected);
                } else {
                    store.dispatch(OrganizationActions.incrementOrganizationBadgeCount(action.organizationId, 1));
                }

                // note: this part has to be done has to be done in the renderer
                if (action.doNotDisturb) {
                    return;
                }

                if (isWin8() || isMac() || isLinux()) {
                    const element = new Notification(clamp(action.data.subject, 63), {
                        body: clamp(action.data.body, 255),
                        icon: action.data.icon,
                        silent: true
                    });

                    element.onclick = () => store.dispatch(NotificationActions.takeActionOnNotification(action.data, action.organizationId));
                }

                return res;
            }
            case NotificationActions.TAKE_ACTION_ON_NOTIFICATION: {
                const res = next(action);

                ipcRenderer.send('command', 'application:restore');

                if (isWin8() || isMac() || isLinux()) {
                    store.dispatch(OrganizationActions.selectOrganization(action.organizationId));
                }

                return res;
            }
        }
        return next(action);
    };
};

export default notification;
