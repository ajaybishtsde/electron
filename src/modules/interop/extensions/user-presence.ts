import { debounce } from 'yggdrasil/lib/lang';
import { isWin, isWin8 } from '../../../os-detection';
import { ipcRenderer, remote } from 'electron';
import { AppConnector } from '../app-connector';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:extensions:presence`);

export function presence() {
    return (connector: AppConnector) => {
        debug('presence ENABLED');

        ipcRenderer.on('interop:user-presence', (evt, state) => {
            debug('presence=', state);
            connector.setPresence(state);
        });
    };
}

export default presence;
