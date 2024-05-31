import { toRemovable, asRemovable } from 'yggdrasil/lib/removable';
import { on } from 'yggdrasil/lib/event';
import { debounce } from 'yggdrasil/lib/lang';
import { app, autoUpdater, Menu } from 'electron';
import { getState } from '../store';
import { getPreferences } from '@modules/core/selectors/preference';
import { subscribe } from 'yggdrasil/lib/topic';

const debug: Debug.Logger = require('debug')(`ryver-desktop:modules:browser:traits:close`);

export function windowClose() {
    return (browserWindow: Electron.BrowserWindow) => {
        let skipCloseCheck = false;
        let skipTaskbar = false;

        return toRemovable(
            on(browserWindow, 'close', (evt) => {
                const { minimizeOnClose } = getPreferences(getState());
                LOG_DEBUG('on window close: minimizeOnClose %s', minimizeOnClose);
                if (skipCloseCheck) {
                    return;
                } else if (minimizeOnClose) {
                    if (process.platform === 'darwin') {
                        Menu.sendActionToFirstResponder('hide:');
                    } else {
                        browserWindow.hide();
                    }
                    /*
                    if (process.platform === 'win32') {
                        browserWindow.minimize();
                        browserWindow.setSkipTaskbar(skipTaskbar = true); // why we have to track this, IDK, Y NO API?
                    } else if (process.platform === 'darwin') {
                        Menu.sendActionToFirstResponder('hide:');
                    } else if (process.platform === 'linux') {
                        browserWindow.minimize();
                        browserWindow.setSkipTaskbar(skipTaskbar = true); // why we have to track this, IDK, Y NO API?
                    }
                    */
                    evt.preventDefault();
                }
            }),
            on(browserWindow, 'restore', () => {
                if (skipTaskbar) {
                    browserWindow.setSkipTaskbar(skipTaskbar = false);
                }
            }),
            on(app, 'before-quit', () => {
                skipCloseCheck = true;
            }),
            on(autoUpdater, 'before-quit-for-update', () => {
                skipCloseCheck = true;
            }),
            subscribe('/update/before-quit-for-update', () => {
                skipCloseCheck = true;
            })
        );
    };
}

export default windowClose;
