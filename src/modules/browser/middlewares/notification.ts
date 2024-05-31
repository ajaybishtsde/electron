import { MiddlewareAPI, StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import { NotificationStateSlice } from '@modules/core/models/notification';
import { OrganizationStateSlice } from '@modules/core/models/organization';
import * as NotificationActions from '@modules/core/actions/notification';
import * as OrganizationActions from '@modules/core/actions/organization';
import { isLessThanWin8, isMac, isWin, isLinux } from '../../../os-detection';
import { getPreferences } from '@modules/core/selectors/preference';
import { app } from 'electron';
import { displayWin7Notification, getWindowManager } from '../Application';
import { DockBounceMode } from '@modules/core/models/preference';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:enhancers:notification`);

// todo: something wrong with enhancer types
export const notification = () => (store: MiddlewareAPI<Dispatch, NotificationStateSlice & OrganizationStateSlice>): any => {
    let dockBounceId: number = null;

    app.on('browser-window-focus', (evt, browserWindow) => {
        if (isMac() && dockBounceId !== null) {
            LOG_DEBUG('clearing dock bounce due to window focus');
            app.dock.cancelBounce(dockBounceId), dockBounceId = null;
        } else if (isWin() || isLinux()) {
            flashMainWindowFrame(false);
        }
    });

    return (next: Dispatch) => (action: NotificationActions.ActionType | OrganizationActions.ActionType) => {
        switch (action.type) {
            case NotificationActions.CREATE_NOTIFICATION: {
                const { data, organizationId, doNotDisturb } = action;
                const { dockBounceMode } = getPreferences(store.getState());
                LOG_DEBUG('dock bounce isMac %s, doNotDisturb %s, dockBounceMode %s', isMac(), doNotDisturb, dockBounceMode);
                if (isMac() && !doNotDisturb && dockBounceMode !== DockBounceMode.None) {
                    LOG_DEBUG('dock bounce start %s', dockBounceMode || DockBounceMode.Critical);
                    if (dockBounceId !== null) {
                        app.dock.cancelBounce(dockBounceId), dockBounceId = null;
                    }
                    dockBounceId = app.dock.bounce(dockBounceMode || DockBounceMode.Critical);
                }
                if (isWin() || isLinux() && getIsMainWindowNotFocused()) {
                    LOG_DEBUG('flashing main window frame');
                    flashMainWindowFrame(true);
                }
                if (isLessThanWin8() && !doNotDisturb) {
                    LOG_DEBUG('creating legacy notification');
                    displayWin7Notification(data, () => store.dispatch(NotificationActions.takeActionOnNotification(data, organizationId)));
                }
                break;
            }
            case NotificationActions.TAKE_ACTION_ON_NOTIFICATION: {
                const { data, organizationId } = action;
                if (isLessThanWin8()) {
                    store.dispatch(OrganizationActions.selectOrganization(organizationId));
                }
                break;
            }
        }
        return next(action);
    };
};

export default notification;

export function getIsMainWindowNotFocused() {
    return getWindowManager().getMainWindow() !== getWindowManager().getFocusedWindow();
}

export function flashMainWindowFrame(flash: boolean) {
    getWindowManager().getMainWindow().flashFrame(flash);
}
