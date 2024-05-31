import { throttle } from 'yggdrasil/lib/lang';
import { isWin, isWin8 } from '../../../os-detection';
import { ipcRenderer, remote } from 'electron';
import { AppConnector } from '../app-connector';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:extensions:unseen-activity`);

export function unseen() {
    return (connector: AppConnector) => {
        debug('unseen ENABLED');

        connector.subscribe('/app/pin/flash', throttle(() => {
            debug('unseen', window.ryverAppContext);
            ipcRenderer.send('window-command', 'window:has-unseen-activity', window.ryverAppContext);
        }, 500));
    };
}

export default unseen;
