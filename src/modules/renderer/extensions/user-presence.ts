import { throttle } from 'yggdrasil/lib/lang';
import { remote } from 'electron';
import { isLockedOrOnScreensaver } from 'node-desktop-session-status';
const { getIdleTime } = require('@eugenepankov/system-idle-time');
const { webContents } = remote;

export interface UserPresenceOptions {
    timeout?: number;
}

function send(status: 'active' | 'inactive') {
    LOG_DEBUG('sending presence %s', status.toUpperCase());
    webContents.getAllWebContents().forEach(webContents => {
        if (webContents.hostWebContents) {
            webContents.send('interop:user-presence', status);
        }
    });
}

const SEND_LIMIT = 15 * 1000;

const sendActive = throttle(() => send('active'), SEND_LIMIT);
const sendInactive = throttle(() => send('inactive'), SEND_LIMIT);

export function userPresence({ timeout = 5 * 60 * 1000 }: UserPresenceOptions = {}) {
    return () => {
        LOG_DEBUG('user-presence ENABLED');
        let idleTime = 0, prevIdleTime = 0;
        let isAway = false, isLocked = isLockedOrOnScreensaver();
        setInterval(() => {
            prevIdleTime = idleTime;
            idleTime = getIdleTime(); // in ms
            isLocked = isLockedOrOnScreensaver();
            if (isAway) {
                if (idleTime < prevIdleTime && !isLocked) {
                    LOG_DEBUG('user now active: idleTime=%d, prevIdleTime=%d, isLocked=%s', idleTime, prevIdleTime, isLocked);
                    sendActive(), isAway = false;
                } else {
                    sendInactive();
                }
            } else {
                if (idleTime > timeout || isLocked) {
                    LOG_DEBUG('user now inactive: idleTime=%d, threshold=%d, isLocked=%s', idleTime, timeout, isLocked);
                    sendInactive(), isAway = true;
                } else if (idleTime < prevIdleTime) {
                    LOG_DEBUG('user now active: idleTime=%d, threshold=%d, isLocked=%s', idleTime, timeout, isLocked);
                    sendActive();
                }
            }
        }, 1000);
    };
}

export default userPresence;
