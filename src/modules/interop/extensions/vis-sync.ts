import { debounce } from 'yggdrasil/lib/lang';
import { isWin, isWin8 } from '../../../os-detection';
import { ipcRenderer, remote } from 'electron';
import { AppConnector } from '../app-connector';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:extensions:vis-sync`);

export function visSync() {
    return (connector: AppConnector) => {
        debug('visible-sync ENABLED');

        setInterval(() => {
            const win = remote.getCurrentWindow();
            const vis = win.isVisible() && (win.isFocused() && !win.isMinimized());
            connector.setIsVisible(vis);
        }, 500);
    };
}

export default visSync;
