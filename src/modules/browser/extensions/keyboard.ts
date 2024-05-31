
import { autoUpdater, globalShortcut } from 'electron';
import { toRemovable, asRemovable, Removable } from 'yggdrasil/lib/removable';
import { sendCommand } from '../Application';
import { on } from 'yggdrasil/lib/event';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:extensions:keyboard`);

export function keyboard() {
    return (app: Electron.App) => {

        const registerShortcut = (accelerator: string, cb: () => void): Removable => {
            globalShortcut.register(accelerator, cb);
            return asRemovable(() => {
                globalShortcut.unregister(accelerator);
            });
        };

        let owned: Removable[] = [];

        const up = () => {
            owned.push(
                registerShortcut(`CommandOrControl+Alt+Shift+${process.platform === 'darwin' ? ',' : 'P'}`, () => {
                    sendCommand('window:show-experimental-settings');
                }),
                registerShortcut(`${process.platform === 'darwin' ? 'Command+Option+I' : 'Control+Shift+I'}`, () => {
                    sendCommand('window:toggle-dev-tools');
                })
            );
        };

        const down = () => {
            owned.forEach(item => item ? item.remove() : void 0);
            owned = [];
        };

        return toRemovable(
            on(app, 'browser-window-focus', up),
            on(app, 'browser-window-blur', down),
            asRemovable(down)
        );
    };
}

export default keyboard;
